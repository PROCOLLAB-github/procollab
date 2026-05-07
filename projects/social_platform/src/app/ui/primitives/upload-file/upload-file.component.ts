/** @format */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  EventEmitter,
  forwardRef,
  inject,
  Input,
  OnInit,
  Output,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { FileService } from "@core/lib/services/file/file.service";
import { nanoid } from "nanoid";
import { IconComponent } from "@ui/primitives";
import { LoaderComponent } from "../loader/loader.component";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

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
  standalone: true,
  imports: [IconComponent, LoaderComponent],
})
export class UploadFileComponent implements OnInit, ControlValueAccessor {
  private readonly fileService = inject(FileService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);

  /** Ограничения по типу файлов */
  @Input() accept = "";

  /** Состояние ошибки */
  @Input() error = false;

  /** Режим: после загрузки сбросить в пустое состояние и не показывать "файл успешно загружен" */
  @Input() resetAfterUpload = false;

  /** Событие с данными загруженного файла (url + метаданные оригинального файла) */
  @Output() uploaded = new EventEmitter<{
    url: string;
    name: string;
    size: number;
    mimeType: string;
  }>();

  ngOnInit(): void {}

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
      .uploadFile(files[0])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        this.loading = false;

        this.value = res.url;
        this.onChange(res.url);
        this.cdr.markForCheck();
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
