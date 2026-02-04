/** @format */

import * as dayjs from "dayjs";
import { FileModel } from "projects/social_platform/src/app/domain/file/file.model";

/**
 * Модель данных для новости профиля пользователя
 *
 * Представляет структуру новости, которую пользователь может публиковать в своем профиле.
 * Содержит всю необходимую информацию для отображения и взаимодействия с новостью.
 *
 * Поля модели:
 * @property {number} id - уникальный идентификатор новости
 * @property {string} name - заголовок/название новости
 * @property {string} imageAddress - URL изображения новости
 * @property {string} text - текстовое содержимое новости
 * @property {string} datetimeCreated - дата и время создания новости (ISO строка)
 * @property {string} datetimeUpdated - дата и время последнего обновления (ISO строка)
 * @property {number} viewsCount - количество просмотров новости
 * @property {number} likesCount - количество лайков новости
 * @property {FileModel[]} files - массив прикрепленных файлов
 * @property {boolean} isUserLiked - флаг, указывающий лайкнул ли текущий пользователь новость
 *
 * Методы:
 * @method default() - статический метод для создания объекта с тестовыми данными
 */
export class ProfileNews {
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

  static default(): ProfileNews {
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
