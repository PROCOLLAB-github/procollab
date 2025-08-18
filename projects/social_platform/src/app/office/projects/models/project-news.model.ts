/** @format */

import * as dayjs from "dayjs";
import { FileModel } from "@models/file.model";

/**
 * Модель для новостей проекта (FeedNews)
 *
 * Представляет структуру новостной записи в ленте проекта.
 *
 * Свойства:
 * - id: уникальный идентификатор новости
 * - name: название/заголовок новости
 * - imageAddress: URL изображения для новости
 * - text: текстовое содержимое новости
 * - datetimeCreated: дата и время создания
 * - datetimeUpdated: дата и время последнего обновления
 * - viewsCount: количество просмотров
 * - likesCount: количество лайков
 * - files: массив прикрепленных файлов
 * - isUserLiked: флаг, лайкнул ли текущий пользователь
 * - pin: флаг закрепления новости (опционально)
 *
 * Методы:
 * - static default(): возвращает объект с тестовыми данными
 *   для использования в разработке и тестировании
 *
 * Используется для отображения новостей в ленте проекта,
 * управления лайками и просмотрами.
 */
export class FeedNews {
  id!: number;
  name!: string;
  imageAddress!: string;
  text!: string;
  datetimeCreated!: string;
  datetimeUpdated!: string;
  viewsCount!: number;
  likesCount!: number;
  files!: FileModel[];
  isUserLiked!: boolean;
  pin?: boolean;

  static default(): FeedNews {
    return {
      id: 13,
      name: "w98ef",
      imageAddress:
        "https://api.selcdn.ru/v1/SEL_228194/procollab_static/6043715490745844423/9115169748862337773.jpg",
      files: [FileModel.default()],
      text: "so8df",
      datetimeCreated: dayjs().format(),
      datetimeUpdated: dayjs().format(),
      viewsCount: 234,
      likesCount: 234,
      isUserLiked: true,
    };
  }
}
