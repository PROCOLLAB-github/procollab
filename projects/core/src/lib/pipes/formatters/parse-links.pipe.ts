/** @format */

import { Pipe, type PipeTransform } from "@angular/core";
import linkifyStr from "linkify-string";

/**
 * Пайп для автоматического преобразования URL в кликабельные ссылки
 *
 * Назначение:
 * - Находит URL в тексте и преобразует их в HTML ссылки <a>
 * - Поддерживает различные протоколы (http, https, ftp)
 * - Автоматически определяет ссылки без протокола (example.com)
 * - Добавляет атрибуты для безопасности (target="_blank", rel="noopener")
 *
 * Использует библиотеку linkify-string для надежного распознавания URL
 *
 * Применение:
 * - Обработка пользовательского контента (комментарии, посты)
 * - Отображение текста с автоматическими ссылками
 * - Преобразование plain text в HTML с ссылками
 *
 * Безопасность:
 * - Библиотека linkify-string экранирует HTML символы
 * - Добавляет rel="noopener" для предотвращения window.opener атак
 * - Рекомендуется использовать с [innerHTML] и DomSanitizer
 */
@Pipe({
  name: "parseLinks",
  standalone: true,
})
export class ParseLinksPipe implements PipeTransform {
  /**
   * Преобразует URL в тексте в кликабельные HTML ссылки
   * @param string - Исходный текст, который может содержать URL
   * @returns HTML строка с преобразованными ссылками
   *
   * Поддерживаемые форматы URL:
   * - https://example.com
   * - http://example.com
   * - ftp://files.example.com
   * - example.com (автоматически добавляется http://)
   * - www.example.com
   * - subdomain.example.com
   *
   * Генерируемые ссылки включают:
   * - target="_blank" - открытие в новой вкладке
   * - rel="noopener noreferrer" - безопасность
   * - Исходный URL как текст ссылки
   *
   * Примеры использования:
   *
   * В компоненте:
   * userMessage = "Посетите наш сайт https://example.com или example.org";
   *
   * В шаблоне:
   * <div [innerHTML]="userMessage | parseLinks"></div>
   *
   * Результат в HTML:
   * <div>
   *   Посетите наш сайт
   *   <a href="https://example.com" target="_blank" rel="noopener noreferrer">
   *     https://example.com
   *   </a>
   *   или
   *   <a href="http://example.org" target="_blank" rel="noopener noreferrer">
   *     example.org
   *   </a>
   * </div>
   *
   * Комбинирование с другими пайпами:
   * <div [innerHTML]="userText | parseBreaks | parseLinks"></div>
   *
   * Важные замечания:
   * - Всегда используйте с [innerHTML], не с обычной интерполяцией {{ }}
   * - Рекомендуется санитизация HTML для предотвращения XSS атак
   * - Библиотека автоматически экранирует специальные HTML символы
   */
  transform(string: string): string {
    // Используем библиотеку linkify-string для преобразования URL в ссылки
    // Библиотека автоматически:
    // - Находит различные форматы URL
    // - Добавляет необходимые атрибуты безопасности
    // - Экранирует HTML символы
    return linkifyStr(string);
  }
}
