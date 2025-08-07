/** @format */

import { Pipe, type PipeTransform } from "@angular/core";

/**
 * Пайп для обработки пользовательских ссылок
 * Преобразует URL в объект с иконкой и отображаемым текстом
 * Поддерживает специальные домены (Telegram, VK) и файловые ссылки
 *
 * Пример использования: {{ userLink | userLinks }}
 */
@Pipe({
  name: "userLinks",
  standalone: true,
})
export class UserLinksPipe implements PipeTransform {
  /** Маппинг доменов на названия иконок */
  icons: Record<string, string> = {
    "t.me": "telegram",
    "vk.com": "vk",
  };

  /**
   * Преобразует строку URL в объект с иконкой и тегом для отображения
   *
   * @param value - URL или строка ссылки
   * @returns объект с полями:
   *   - iconName: название иконки для отображения
   *   - tag: текст для отображения пользователю
   *
   * Логика обработки:
   * - Email адреса и специальные ссылки (procollab_media, api.selcdn.ru) → иконка "file" или "link"
   * - Telegram и VK ссылки → соответствующие иконки с username
   * - Остальные ссылки → иконка "link" с полным URL
   */
  transform(value: string): { iconName: string; tag: string } {
    // Обработка email адресов и специальных файловых ссылок
    if (
      value.includes("@") ||
      value.includes("procollab_media") ||
      value.includes("api.selcdn.ru/v1")
    ) {
      const valueTrimed = value.replace(/^https?:\/\//, "");
      return {
        iconName:
          value.includes("procollab_media") || value.includes("api.selcdn.ru/v1") ? "file" : "link",
        tag: valueTrimed,
      };
    }

    // Обработка обычных URL
    const url = new URL(value);
    let domain = url.hostname;
    domain = domain.split(".").slice(-2).join("."); // Получаем основной домен

    let tag = url.pathname;
    // Если путь сложный или домен не поддерживается - показываем полный URL
    if (tag.split("/").filter(Boolean).length > 1 || !this.icons[domain]) {
      tag = value;
    } else {
      // Для поддерживаемых доменов показываем username с @
      tag = "@" + tag.replace(/\//g, "");
    }

    return { iconName: this.icons[domain] ?? "link", tag };
  }
}
