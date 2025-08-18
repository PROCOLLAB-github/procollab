/** @format */

import { Pipe, PipeTransform } from "@angular/core";

/**
 * Pipe для определения типа файла по MIME-типу.
 * Преобразует MIME-тип в читаемое название типа файла.
 *
 * Принимает:
 * - value: MIME-тип файла (string)
 *
 * Возвращает:
 * - string: сокращенное название типа файла (jpeg, png, pdf, mp4 и т.д.)
 *
 * Использование: {{ mimeType | fileType }}
 */
@Pipe({
  name: "fileType",
  standalone: true,
})
export class FileTypePipe implements PipeTransform {
  /** Карта соответствия MIME-типов к читаемым названиям */
  private readonly typeMap: Record<string, string> = {
    // изображения
    "image/jpeg": "jpeg",
    "image/png": "png",
    "image/wepb": "webp",
    "image/svg+xml": "svg",
    "image/*": "image",
    // медиа
    "video/mp4": "mp4",
    "audio/mpeg": "mp3",
    // документы
    "application/pdf": "pdf",
    "application/doc": "doc",
    "text/plain": "txt",
    "text/csv": "csv",
    "application/vnd.ms-powerpoint": "ppt",
    // архивы
    "application/zip": "arch",
    "*": "file",
  };

  /**
   * Преобразует MIME-тип в читаемое название типа файла
   * @param value - MIME-тип файла
   * @returns сокращенное название типа файла
   */
  transform(value: string): string {
    if (value.includes("image/")) {
      return this.typeMap[value] ?? this.typeMap["image/*"];
    }
    return this.typeMap[value] ?? this.typeMap["*"];
  }
}
