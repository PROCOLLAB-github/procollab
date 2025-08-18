/** @format */

import { Component, forwardRef, Input, OnInit } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { nanoid } from "nanoid";
import { FileService } from "@core/services/file.service";
import { catchError, concatMap, map, of } from "rxjs";
import { IconComponent } from "@ui/components";
import { LoaderComponent } from "../loader/loader.component";
import { CommonModule } from "@angular/common";

/**
 * Компонент для управления аватаром пользователя.
 * Реализует ControlValueAccessor для интеграции с Angular Forms.
 * Позволяет загружать, обновлять и удалять изображение аватара.
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
  imports: [LoaderComponent, IconComponent, CommonModule],
})
export class AvatarControlComponent implements OnInit, ControlValueAccessor {
  constructor(private fileService: FileService) {}

  /** Размер авата��а в пикселях */
  @Input() size = 140;

  /** Состояние ошибки */
  @Input() error = false;

  /** Тип аватара */
  @Input() type: "avatar" | "project" | "profile" = "avatar";

  ngOnInit(): void {}

  /** Уникальный ID для элемента input */
  controlId = nanoid(3);

  /** Текущее значение URL изображения */
  value = "";

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
   * Обработчик обновления изображения
   * Загружает новый файл, при наличии старого - сначала удаляет его
   */
  onUpdate(event: Event) {
    const files = (event.currentTarget as HTMLInputElement).files;

    if (!files?.length) {
      return;
    }

    this.loading = true;

    const source = this.value
      ? this.fileService.deleteFile(this.value).pipe(
          catchError(err => {
            console.error(err);
            return of({});
          }),
          concatMap(() => this.fileService.uploadFile(files[0])),
          map(r => r["url"])
        )
      : this.fileService.uploadFile(files[0]).pipe(map(r => r.url));

    source.subscribe(this.updateValue.bind(this));
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
