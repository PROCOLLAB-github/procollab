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
  transform(value: string): string {
    if (!value) {
      return "";
    }

    const httpsPrefix = "https://";
    const httpPrefix = "http://";

    let domainStartIndex = -1;

    if (value.startsWith(httpsPrefix)) {
      domainStartIndex = httpsPrefix.length;
    } else if (value.startsWith(httpPrefix)) {
      domainStartIndex = httpPrefix.length;
    } else {
      return "";
    }

    const domainEndIndex = value.indexOf(".", domainStartIndex);

    if (domainEndIndex === -1) {
      return value.substring(domainStartIndex);
    }

    return value.substring(domainStartIndex, domainEndIndex);
  }
}
