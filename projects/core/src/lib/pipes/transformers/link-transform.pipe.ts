/** @format */

import { Pipe, type PipeTransform } from "@angular/core";

/**
 * Пайп для извлечения доменного имени из URL
 *
 * Назначение:
 * - Извлекает основное доменное имя из полного URL
 * - Убирает протокол (https://) и поддомены (www.)
 * - Возвращает только основную часть домена для отображения
 *
 * Применение:
 * - Отображение кратких названий ссылок
 * - Показ источника ссылки без полного URL
 * - Создание читаемых меток для внешних ссылок
 *
 * Алгоритм:
 * - Ищет протокол https://
 * - Извлекает часть между протоколом и первой точкой
 * - Возвращает доменное имя без расширения
 */
@Pipe({
  name: "linkTransform",
  standalone: true,
})
export class LinkTransformPipe implements PipeTransform {
  /**
   * Извлекает доменное имя из URL
   * @param value - Полный URL для обработки
   * @returns Доменное имя или пустая строка
   *
   * Поддерживаемый формат:
   * - Только HTTPS URL (https://)
   * - URL должен содержать точку в доменной части
   *
   * Алгоритм извлечения:
   * 1. Проверяет наличие значения
   * 2. Ищет префикс "https://" в строке
   * 3. Находит начало доменного имени после протокола
   * 4. Ищет первую точку после доменного имени
   * 5. Извлекает подстроку между протоколом и точкой
   *
   * Примеры использования в шаблонах:
   *
   * <!-- Отображение источника ссылки -->
   * <a [href]="link.url" target="_blank">
   *   {{ link.url | linkTransform }}
   * </a>
   *
   * <!-- В списке ссылок -->
   * <div *ngFor="let link of externalLinks">
   *   <span class="domain">{{ link | linkTransform }}</span>
   *   <a [href]="link">{{ link }}</a>
   * </div>
   *
   * <!-- Краткое отображение -->
   * <span class="link-preview">
   *   Ссылка на {{ url | linkTransform }}
   * </span>
   *
   * Примеры результатов:
   * - "https://github.com/user/repo" → "github"
   * - "https://www.google.com/search" → "www.google"
   * - "https://api.example.com/v1" → "api.example"
   * - "http://example.com" → "" (не поддерживается HTTP)
   * - "https://example" → "example" (нет точки)
   * - "" → "" (пустая строка)
   * - null → "" (null значение)
   *
   * Ограничения:
   * - Работает только с HTTPS URL
   * - Не обрабатывает HTTP протокол
   * - Не учитывает сложные структуры доменов
   * - Возвращает пустую строку для некорректных URL
   */
  transform(value: string) {
    // Проверяем наличие значения
    if (!value) {
      return "";
    }

    const httpsPrefix = "https://";

    // Ищем позицию протокола HTTPS в строке
    const startIndex = value.indexOf(httpsPrefix);

    // Если HTTPS не найден, возвращаем пустую строку
    if (startIndex === -1) {
      return "";
    }

    // Вычисляем начало доменного имени (после протокола)
    const domainStartIndex = startIndex + httpsPrefix.length;

    // Ищем первую точку после доменного имени
    const domainEndIndex = value.indexOf(".", domainStartIndex);

    // Если точка не найдена, возвращаем всё что после протокола
    if (domainEndIndex === -1) {
      return value.substring(domainStartIndex);
    }

    // Извлекаем доменное имя между протоколом и первой точкой
    return value.substring(domainStartIndex, domainEndIndex);
  }
}
