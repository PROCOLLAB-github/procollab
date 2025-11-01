/** @format */

import { Component, forwardRef, Input, OnInit } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { FileService } from "@core/services/file.service";
import { nanoid } from "nanoid";
import { IconComponent } from "@ui/components";
import { SlicePipe } from "@angular/common";
import { LoaderComponent } from "../loader/loader.component";

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
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UploadFileComponent),
      multi: true,
    },
  ],
  standalone: true,
  imports: [IconComponent, SlicePipe, LoaderComponent],
})
export class UploadFileComponent implements OnInit, ControlValueAccessor {
  constructor(private fileService: FileService) {}

  /** Ограничения по типу файлов */
  @Input() accept = "";

  /** Состояние ошибки */
  @Input() error = false;

  ngOnInit(): void {}

  /** Уникальный ID для элемента input */
  controlId = nanoid(3);

  /** URL загруженного файла */
  value = "";

  // Методы ControlValueAccessor
  writeValue(url: string) {
    this.value = url;
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
    const files = (event.currentTarget as HTMLInputElement).files;
    if (!files?.length) {
      return;
    }

    this.loading = true;

    this.fileService.uploadFile(files[0]).subscribe(res => {
      this.loading = false;

      this.value = res.url;
      this.onChange(res.url);
    });
  }

  /** Обработчик удаления файла */
  onRemove(): void {
    this.fileService.deleteFile(this.value).subscribe({
      next: () => {
        this.value = "";

        this.onTouch();
        this.onChange("");
      },
      error: () => {
        this.value = "";

        this.onTouch();
        this.onChange("");
      },
    });
  }
}
