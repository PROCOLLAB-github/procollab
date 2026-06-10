/** @format */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  forwardRef,
  inject,
  input,
  output,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { HttpErrorResponse } from "@angular/common/http";
import { FileService } from "@core/lib/services/file/file.service";
import { SnackbarService } from "@domain/shared/snackbar.service";
import { nanoid } from "nanoid";
import { LoaderComponent } from "../loader/loader.component";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { IconComponent } from "../icon/icon.component";

/**
 * Компонент для загрузки файлов с предварительным просмотром.
 * Реализует ControlValueAccessor для интеграции с Angular Forms.
 * Поддерживает ограничения по типу файлов и показывает состояние загрузки.
 *
 * Входящие параметры:
 * - accept: ограничения по типу файлов (MIME-типы)
 * - error: состояние ошибки для стилизации
 *
 * Возвращает:
 * - URL загруженного файла через ControlValueAccessor
 *
 * Функциональность:
 * - Drag & drop и выбор файлов через диалог
 * - Предварительный просмотр выбранного файла
 * - Индикатор загрузки
 * - Возможность удаления загруженного файла
 */
@Component({
  selector: "app-upload-file",
  templateUrl: "./upload-file.component.html",
  styleUrl: "./upload-file.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UploadFileComponent),
      multi: true,
    },
  ],
  imports: [IconComponent, LoaderComponent],
})
export class UploadFileComponent implements ControlValueAccessor {
  private readonly fileService = inject(FileService);
  private readonly snackbarService = inject(SnackbarService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);

  /** Ограничения по типу файлов */
  accept = input("");

  /** Состояние ошибки */
  error = input(false);

  /** Режим: после загрузки сбросить в пустое состояние и не показывать "файл успешно загружен" */
  resetAfterUpload = input(false);

  /** Событие с данными загруженного файла (url + метаданные оригинального файла) */
  uploaded = output<{
    url: string;
    name: string;
    size: number;
    mimeType: string;
  }>();

  /** Уникальный ID для элемента input */
  controlId = nanoid(3);

  /** URL загруженного файла */
  value = "";

  // Методы ControlValueAccessor
  writeValue(url: string) {
    this.value = url;
    this.cdr.markForCheck();
  }

  onTouch: () => void = () => {};

  registerOnTouched(fn: any) {
    this.onTouch = fn;
  }

  onChange: (url: string) => void = () => {};

  registerOnChange(fn: any) {
    this.onChange = fn;
  }

  /** Состояние загрузки */
  loading = false;

  /** Обработчик загрузки файла */
  onUpdate(event: Event): void {
    const input = event.currentTarget as HTMLInputElement;
    const files = input.files;
    if (!files?.length) {
      return;
    }

    const originalFile = files[0];
    this.loading = true;
    this.cdr.markForCheck();

    this.fileService
      .uploadFile(originalFile)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          this.loading = false;

          this.value = res.url;
          this.onChange(res.url);
          this.cdr.markForCheck();
          this.uploaded.emit({
            url: res.url,
            name: originalFile.name,
            size: originalFile.size,
            mimeType: originalFile.type,
          });
        },
        error: (err: HttpErrorResponse) => {
          this.loading = false;
          this.cdr.markForCheck();

          if (err.status === 413) {
            this.snackbarService.error(
              "Файл превышает допустимый размер. Уменьшите или измените размер файла и попробуйте снова.",
            );
          } else {
            this.snackbarService.error("Ошибка загрузки файла. Попробуйте ещё раз.");
          }
        },
      });
  }

  /** Обработчик удаления файла */
  onRemove(): void {
    this.fileService
      .deleteFile(this.value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.value = "";

          this.onTouch();
          this.onChange("");
          this.cdr.markForCheck();
        },
        error: () => {
          this.value = "";

          this.onTouch();
          this.onChange("");
          this.cdr.markForCheck();
        },
      });
  }
}
