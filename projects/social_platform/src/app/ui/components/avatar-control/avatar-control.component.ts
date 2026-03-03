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

  /** Исправленное изображение в формате base64 для кроппера */
  correctedImageBase64 = "";

  /**
   * Обработчик выбора файла - открывает кроппер
   */
  onFileSelected(event: Event) {
    const files = (event.currentTarget as HTMLInputElement).files;

    if (!files?.length) {
      return;
    }

    // Обрабатываем EXIF ориентацию перед открытием кроппера
    this.fixImageOrientation(files[0], () => {
      // Используем исходное событие, но imageChangedEvent уже содержит исправленное изображение
      this.imageChangedEvent = event;
      this.showCropperModal = true;
    });
  }

  /**
   * Исправляет EXIF ориентацию изображения
   * Решает проблему с повернутыми фотографиями со смартфонов
   */
  private fixImageOrientation(file: File, onComplete: () => void) {
    const reader = new FileReader();

    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        // Читаем EXIF данные для определения ориентации
        this.getImageOrientation(file, orientation => {
          // Если ориентация нормальная (1), просто используем исходное изображение
          if (orientation === 1) {
            this.correctedImageBase64 = "";
            onComplete();
            return;
          }

          // Ротируем изображение на Canvas
          const canvas = this.rotateImage(img, orientation);
          this.correctedImageBase64 = canvas.toDataURL(file.type);
          onComplete();
        });
      };
      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  }

  /**
   * Определяет EXIF ориентацию изображения
   */
  private getImageOrientation(file: File, onOrientationDetected: (orientation: number) => void) {
    const reader = new FileReader();

    reader.onload = event => {
      const view = new DataView(event.target?.result as ArrayBuffer);
      // Проверяем JPEG маркер
      if (view.byteLength < 2 || view.getUint16(0) !== 0xffd8) {
        onOrientationDetected(1); // Не JPEG, используем нормальную ориентацию
        return;
      }

      let offset = 2;
      // Ищем EXIF данные
      while (offset < view.byteLength - 9) {
        if (view.getUint16(offset) === 0xffe1) {
          const length = view.getUint16(offset + 2) + 2;
          // Проверяем EXIF идентификатор
          if (view.getUint32(offset + 4) === 0x45786966 && view.getUint16(offset + 8) === 0x0000) {
            const orientation = this.getExifOrientation(view, offset + 10);
            onOrientationDetected(orientation);
            return;
          }
          offset += length;
        } else {
          offset += 2;
        }
      }
      onOrientationDetected(1); // EXIF не найден, используем нормальную ориентацию
    };

    reader.readAsArrayBuffer(file);
  }

  /**
   * Извлекает значение ориентации из EXIF данных
   */
  private getExifOrientation(view: DataView, offset: number): number {
    try {
      const littleEndian = view.getUint16(offset) === 0x4949;
      const ifdOffset = view.getUint32(offset + 4, littleEndian);
      const entries = view.getUint16(offset + ifdOffset, littleEndian);

      for (let i = 0; i < entries; i++) {
        const entryOffset = offset + ifdOffset + 2 + i * 12;
        const tag = view.getUint16(entryOffset, littleEndian);
        // 0x0112 это тег для ориентации (Orientation tag)
        if (tag === 0x0112) {
          const value = view.getUint32(entryOffset + 8, littleEndian);
          return value > 1 && value <= 8 ? value : 1;
        }
      }
    } catch (e) {
      console.warn("Ошибка при чтении EXIF ориентации:", e);
    }
    return 1;
  }

  /**
   * Ротирует изображение на Canvas в зависимости от EXIF ориентации
   */
  private rotateImage(img: HTMLImageElement, orientation: number): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return canvas;
    }

    const [newWidth, newHeight] = [img.width, img.height];

    switch (orientation) {
      case 2:
        canvas.width = newWidth;
        canvas.height = newHeight;
        ctx.scale(-1, 1);
        ctx.drawImage(img, -newWidth, 0);
        break;
      case 3:
        canvas.width = newWidth;
        canvas.height = newHeight;
        ctx.rotate(Math.PI);
        ctx.drawImage(img, -newWidth, -newHeight);
        break;
      case 4:
        canvas.width = newWidth;
        canvas.height = newHeight;
        ctx.scale(1, -1);
        ctx.drawImage(img, 0, -newHeight);
        break;
      case 5:
        canvas.width = newHeight;
        canvas.height = newWidth;
        ctx.rotate(Math.PI / 2);
        ctx.scale(-1, 1);
        ctx.drawImage(img, -newHeight, 0);
        break;
      case 6:
        canvas.width = newHeight;
        canvas.height = newWidth;
        ctx.rotate(Math.PI / 2);
        ctx.drawImage(img, 0, -newWidth);
        break;
      case 7:
        canvas.width = newHeight;
        canvas.height = newWidth;
        ctx.rotate(-Math.PI / 2);
        ctx.scale(-1, 1);
        ctx.drawImage(img, -newHeight, -newWidth);
        break;
      case 8:
        canvas.width = newHeight;
        canvas.height = newWidth;
        ctx.rotate(-Math.PI / 2);
        ctx.drawImage(img, -newHeight, 0);
        break;
      default:
        canvas.width = newWidth;
        canvas.height = newHeight;
        ctx.drawImage(img, 0, 0);
    }

    return canvas;
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
