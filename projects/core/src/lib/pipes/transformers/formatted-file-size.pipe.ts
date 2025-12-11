/** @format */

import { Pipe, type PipeTransform } from "@angular/core";

/**
 * Пайп для форматирования размера файла в человекочитаемый вид
 * Преобразует размер в байтах в строку с соответствующими единицами измерения
 *
 * Пример использования: {{ fileSize | formatedFileSize }}
 * Результат: "1.5 MB", "256 KB", "2.0 GB"
 */
@Pipe({
  standalone: true,
  name: "formatedFileSize",
})
export class FormatedFileSizePipe implements PipeTransform {
  /**
   * Преобразует размер файла из байтов в читаемый формат
   *
   * @param bytes - размер файла в байтах (число)
   * @returns строка с размером файла и единицами измерения (например, "1.5 MB")
   *
   * Поддерживаемые единицы: Bytes, KB, MB, GB
   * Использует систему 1024 (бинарную) для расчета размеров
   */
  transform(bytes: number): string {
    const sizes = ["Bytes", "KB", "MB", "GB"];

    if (bytes === 0) return "0 Bytes";

    // Определяем индекс единицы измерения
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    // Вычисляем размер с одним знаком после запятой
    const size = Math.round(bytes / Math.pow(1024, i)).toFixed(1);

    return `${size} ${sizes[i]}`;
  }
}
