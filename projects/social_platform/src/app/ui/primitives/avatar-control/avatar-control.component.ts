/** @format */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  forwardRef,
  inject,
  input,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { nanoid } from "nanoid";
import { FileService } from "@core/lib/services/file/file.service";
import { catchError, concatMap, map, of } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { CommonModule } from "@angular/common";
import { ImageCroppedEvent, ImageCropperComponent } from "ngx-image-cropper";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { LoggerService } from "@corelib";
import { LoaderComponent } from "../loader/loader.component";
import { ModalComponent } from "../modal/modal.component";
import { ButtonComponent } from "../button/button.component";
import { TooltipComponent } from "../tooltip/tooltip.component";
import { IconComponent } from "../icon/icon.component";

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
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        LoaderComponent,
        IconComponent,
        CommonModule,
        ImageCropperComponent,
        ModalComponent,
        ButtonComponent,
        TooltipComponent,
    ]
})
export class AvatarControlComponent implements ControlValueAccessor {
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private fileService: FileService,
    private sanitizer: DomSanitizer,
    private readonly loggerService: LoggerService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  /** Размер аватара в пикселях */
  size = input(140);

  /** Состояние ошибки */
  error = input(false);

  /** Тип аватара */
  type = input<"avatar" | "project" | "profile">("avatar");

  /** Наличие подсказки */
  haveHint = input(false);

  /** Текст для подсказки */
  tooltipText = input<string>();

  /** Позиция подсказки */
  tooltipPosition = input<"left" | "right">("right");

  /** Ширина подсказки */
  tooltipWidth = input(250);

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
    this.cdr.markForCheck();
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

    this.fixImageOrientation(files[0], () => {
      this.imageChangedEvent = event;
      this.showCropperModal = true;
    });
  }

  private fixImageOrientation(file: File, onComplete: () => void) {
    const reader = new FileReader();

    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        this.getImageOrientation(file, orientation => {
          if (orientation === 1) {
            this.correctedImageBase64 = "";
            onComplete();
            return;
          }

          const canvas = this.rotateImage(img, orientation);
          this.correctedImageBase64 = canvas.toDataURL(file.type);
          onComplete();
        });
      };
      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  }

  private getImageOrientation(file: File, onOrientationDetected: (orientation: number) => void) {
    const reader = new FileReader();

    reader.onload = event => {
      const view = new DataView(event.target?.result as ArrayBuffer);
      if (view.byteLength < 2 || view.getUint16(0) !== 0xffd8) {
        onOrientationDetected(1);
        return;
      }

      let offset = 2;
      while (offset < view.byteLength - 9) {
        if (view.getUint16(offset) === 0xffe1) {
          const length = view.getUint16(offset + 2) + 2;
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
      onOrientationDetected(1);
    };

    reader.readAsArrayBuffer(file);
  }

  private getExifOrientation(view: DataView, offset: number): number {
    try {
      const littleEndian = view.getUint16(offset) === 0x4949;
      const ifdOffset = view.getUint32(offset + 4, littleEndian);
      const entries = view.getUint16(offset + ifdOffset, littleEndian);

      for (let i = 0; i < entries; i++) {
        const entryOffset = offset + ifdOffset + 2 + i * 12;
        const tag = view.getUint16(entryOffset, littleEndian);
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

  imageCropped(event: ImageCroppedEvent) {
    if (event.objectUrl) {
      this.croppedImage = this.sanitizer.bypassSecurityTrustUrl(event.objectUrl);
    }
    this.croppedBlob = event.blob || null;
  }

  imageLoaded() {}

  cropperReady() {}

  loadImageFailed() {
    this.loggerService.error("Не удалось загрузить изображение");
    this.showCropperModalErrorMessage = "Не удалось загрузить изображение. Попробуйте ещё раз!";
    this.cdr.markForCheck();
  }

  saveCroppedImage() {
    if (!this.croppedBlob) {
      return;
    }

    this.loading = true;
    this.showCropperModal = false;
    this.cdr.markForCheck();

    const file = new File([this.croppedBlob], "cropped-avatar.jpg", {
      type: "image/jpeg",
      lastModified: Date.now(),
    });

    const source = this.value
      ? this.fileService.deleteFile(this.value).pipe(
          catchError(err => {
            this.loggerService.error(err);
            return of({});
          }),
          concatMap(() => this.fileService.uploadFile(file)),
          map(r => r["url"]),
          takeUntilDestroyed(this.destroyRef)
        )
      : this.fileService.uploadFile(file).pipe(
          map(r => r.url),
          takeUntilDestroyed(this.destroyRef)
        );

    source.subscribe(this.updateValue.bind(this));
  }

  closeCropper() {
    this.showCropperModal = false;
    this.imageChangedEvent = null;
    this.croppedImage = "";
    this.croppedBlob = null;
    this.cdr.markForCheck();

    const input = document.getElementById(this.controlId) as HTMLInputElement;
    if (input) {
      input.value = "";
    }
  }

  showTooltip(): void {
    this.isTooltipVisible = true;
  }

  hideTooltip(): void {
    this.isTooltipVisible = false;
  }

  private updateValue(url: string): void {
    this.loading = false;

    this.onChange(url);
    this.value = url;

    this.onTouch();
    this.cdr.markForCheck();
  }
}
