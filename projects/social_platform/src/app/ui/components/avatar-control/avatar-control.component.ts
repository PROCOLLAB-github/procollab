/** @format */

import { Component, forwardRef, Input, OnInit } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { nanoid } from "nanoid";
import { FileService } from "@core/services/file.service";
import { catchError, concatMap, map, of } from "rxjs";
import { IconComponent, ButtonComponent } from "@ui/components";
import { LoaderComponent } from "../loader/loader.component";
import { CommonModule } from "@angular/common";
import { ImageCroppedEvent, ImageCropperComponent } from "ngx-image-cropper";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { ModalComponent } from "../modal/modal.component";
import { TooltipComponent } from "../tooltip/tooltip.component";

/**
 * Компонент для управления аватаром пользователя.
 * Реализует ControlValueAccessor для интеграции с Angular Forms.
 * Позволяет загружать, обрезать, обновлять и удалять изображение аватара.
 *
 * Входящие параметры:
 * - size: размер аватара в пикселях (по умолчанию 140)
 * - error: состояние ошибки для отображения красной рамки
 * - type: тип аватара ("avatar" | "project" | "profile", по умолчанию "avatar")
 *
 * Возвращает:
 * - URL загруженного изображения через ControlValueAccessor
 */
@Component({
  selector: "app-avatar-control",
  templateUrl: "./avatar-control.component.html",
  styleUrl: "./avatar-control.component.scss",
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AvatarControlComponent),
      multi: true,
    },
  ],
  standalone: true,
  imports: [
    LoaderComponent,
    IconComponent,
    CommonModule,
    ImageCropperComponent,
    ModalComponent,
    ButtonComponent,
    TooltipComponent,
  ],
})
export class AvatarControlComponent implements OnInit, ControlValueAccessor {
  constructor(private fileService: FileService, private sanitizer: DomSanitizer) {}

  /** Размер аватара в пикселях */
  @Input() size = 140;

  /** Состояние ошибки */
  @Input() error = false;

  /** Тип аватара */
  @Input() type: "avatar" | "project" | "profile" = "avatar";

  /** Наличие подсказки */
  @Input() haveHint = false;

  /** Текст для подсказки */
  @Input() tooltipText?: string;

  /** Позиция подсказки */
  @Input() tooltipPosition: "left" | "right" = "right";

  /** Ширина подсказки */
  @Input() tooltipWidth = 250;

  ngOnInit(): void {}

  /** Уникальный ID для элемента input */
  controlId = nanoid(3);

  /** Состояние видимости подсказки */
  isTooltipVisible = false;

  /** Текущее значение URL изображения */
  value = "";

  /** Показывать ли модальное окно кроппера */
  showCropperModal = false;

  /** Текст ошибки при обрезки фотографии */
  showCropperModalErrorMessage = "";

  /** Исходное изображение для обрезки */
  imageChangedEvent: Event | null = null;

  /** Обрезанное изображение */
  croppedImage: SafeUrl = "";

  /** Blob обрезанного изображения для загрузки */
  croppedBlob: Blob | null = null;

  /** Записывает значение URL изображения */
  writeValue(address: string) {
    this.value = address;
  }

  onTouch: () => void = () => {};

  registerOnTouched(fn: any) {
    this.onTouch = fn;
  }

  onChange: (value: string) => void = () => {};

  registerOnChange(fn: any) {
    this.onChange = fn;
  }

  /** Состояние загрузки файла */
  loading = false;

  /**
   * Обработчик выбора файла - открывает кроппер
   */
  onFileSelected(event: Event) {
    const files = (event.currentTarget as HTMLInputElement).files;

    if (!files?.length) {
      return;
    }

    this.imageChangedEvent = event;
    this.showCropperModal = true;
  }

  /**
   * Обработчик обрезки изображения
   */
  imageCropped(event: ImageCroppedEvent) {
    if (event.objectUrl) {
      this.croppedImage = this.sanitizer.bypassSecurityTrustUrl(event.objectUrl);
    }
    this.croppedBlob = event.blob || null;
  }

  /**
   * Обработчик загружено фото или нет
   */
  imageLoaded() {}

  /**
   * Обработчик готовности обрезки фотографии
   */
  cropperReady() {}

  /**
   * Обработчик ошибки загрузки
   */
  loadImageFailed() {
    console.error("Не удалось загрузить изображение");
    this.showCropperModalErrorMessage = "Не удалось загрузить изображение. Попробуйте ещё раз!";
  }

  /**
   * Сохранить обрезанное изображение
   */
  saveCroppedImage() {
    if (!this.croppedBlob) {
      return;
    }

    this.loading = true;
    this.showCropperModal = false;

    // Создаем файл из blob
    const file = new File([this.croppedBlob], "cropped-avatar.jpg", {
      type: "image/jpeg",
      lastModified: Date.now(),
    });

    const source = this.value
      ? this.fileService.deleteFile(this.value).pipe(
          catchError(err => {
            console.error(err);
            return of({});
          }),
          concatMap(() => this.fileService.uploadFile(file)),
          map(r => r["url"])
        )
      : this.fileService.uploadFile(file).pipe(map(r => r.url));

    source.subscribe(this.updateValue.bind(this));
  }

  /**
   * Закрыть кроппер без сохранения
   */
  closeCropper() {
    this.showCropperModal = false;
    this.imageChangedEvent = null;
    this.croppedImage = "";
    this.croppedBlob = null;

    // Сбрасываем значение input
    const input = document.getElementById(this.controlId) as HTMLInputElement;
    if (input) {
      input.value = "";
    }
  }

  /** Показать подсказку */
  showTooltip(): void {
    this.isTooltipVisible = true;
  }

  /** Скрыть подсказку */
  hideTooltip(): void {
    this.isTooltipVisible = false;
  }

  /**
   * Обновляет значение URL и уведомляет о изменении
   * @param url - новый URL изображения
   */
  private updateValue(url: string): void {
    this.loading = false;

    this.onChange(url);
    this.value = url;

    this.onTouch();
  }
}
