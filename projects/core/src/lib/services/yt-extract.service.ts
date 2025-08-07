/** @format */

import { Injectable } from "@angular/core";

/**
 * Сервис для извлечения и обработки YouTube ссылок из текста
 *
 * Назначение:
 * - Находит YouTube ссылки в произвольном тексте
 * - Извлекает video ID из различных форматов YouTube URL
 * - Преобразует ссылки в embed формат для встраивания
 * - Очищает исходный текст от YouTube ссылок
 *
 * Поддерживаемые форматы URL:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - http://youtube.com/watch?v=VIDEO_ID
 * - youtube.com/watch?v=VIDEO_ID (без протокола)
 *
 * Применение:
 * - Обработка пользовательского контента с YouTube ссылками
 * - Автоматическое встраивание видео в посты/комментарии
 * - Разделение текстового и видео контента
 */
@Injectable({
  providedIn: "root",
})
export class YtExtractService {
  /**
   * Извлекает YouTube ссылку из текста и преобразует в embed формат
   * @param value - Исходный текст, который может содержать YouTube ссылку
   * @returns Объект с извлеченной embed ссылкой и очищенным текстом
   *
   * Возвращаемый объект:
   * - extractedLink?: string - YouTube embed URL (если ссылка найдена)
   * - newText: string - Исходный текст без YouTube ссылки
   *
   * Алгоритм работы:
   * 1. Ищет YouTube ссылку в тексте с помощью регулярного выражения
   * 2. Если ссылка не найдена - возвращает исходный текст
   * 3. Если найдена - извлекает video ID
   * 4. Создает embed URL: https://www.youtube.com/embed/VIDEO_ID
   * 5. Удаляет исходную ссылку из текста
   *
   * Пример использования:
   * const text = "Посмотрите это видео: https://www.youtube.com/watch?v=dQw4w9WgXcQ Очень интересно!";
   * const result = ytExtractService.transform(text);
   * // result.extractedLink = "https://www.youtube.com/embed/dQw4w9WgXcQ"
   * // result.newText = "Посмотрите это видео:  Очень интересно!"
   */
  transform(value: any): { extractedLink?: string; newText: string } {
    // Регулярное выражение для поиска YouTube ссылок
    // Покрывает различные форматы: youtube.com, youtu.be, с протоколом и без
    const youtubeRegex = /(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/gm;

    // Ищем первое совпадение в тексте
    const match = youtubeRegex.exec(value);
    if (!match) {
      // YouTube ссылка не найдена, возвращаем исходный текст
      return { newText: value };
    }

    // Извлеченная YouTube ссылка (полная)
    const extractedLink = match[0];

    // Удаляем YouTube ссылку из исходного текста
    const newText = value.replace(extractedLink, "");

    // Извлекаем video ID из ссылки
    // Регулярное выражение для поиска 11-символьного video ID
    // Поддерживает форматы: ?v=ID, /ID, /embed/ID
    const videoIdRegex = /(?:v=|\/)([A-Za-z0-9_-]{11})/;
    const videoIdMatch = extractedLink.match(videoIdRegex);
    let embedLink = "";

    if (videoIdMatch && videoIdMatch[1]) {
      const videoId = videoIdMatch[1];
      // Создаем embed URL для встраивания
      embedLink = `https://www.youtube.com/embed/${videoId}`;
    }

    return {
      extractedLink: embedLink, // Embed URL для встраивания
      newText, // Текст без YouTube ссылки
    };
  }
}
