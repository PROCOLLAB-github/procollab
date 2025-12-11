/** @format */

/**
 * Основная модель программы в системе
 *
 * Содержит полную информацию о программе, включая метаданные,
 * даты проведения, статистику и права пользователя.
 *
 * Свойства:
 * @param {number} id - Уникальный идентификатор программы
 * @param {string} imageAddress - URL основного изображения
 * @param {string} coverImageAddress - URL обложки программы
 * @param {string} presentationAddress - URL презентации программы
 * @param {string} advertisementImageAddress - URL рекламного изображения
 * @param {string} name - Название программы
 * @param {string} description - Полное описание программы
 * @param {string} city - Город проведения программы
 * @param {string} tag - Тег/категория программы
 * @param {number} year - Год проведения программы
 * @param {string[]} links - Массив полезных ссылок
 * @param {Array<{title: string; url: string}>} materials - Материалы программы
 * @param {string} shortDescription - Краткое описание программы
 * @param {string} datetimeRegistrationEnds - Дата окончания регистрации
 * @param {string} datetimeStarted - Дата начала программы
 * @param {string} datetimeFinished - Дата окончания программы
 * @param {number} viewsCount - Количество просмотров
 * @param {number} likesCount - Количество лайков
 * @param {boolean} isUserLiked - Лайкнул ли текущий пользователь
 * @param {boolean} isUserManager - Является ли пользователь менеджером программы
 * @param {boolean} isUserMember - Является ли пользователь участником программы
 *
 * Методы:
 * @method static default() - Возвращает объект программы с дефолтными значениями
 */
export class Program {
  id!: number;
  imageAddress!: string;
  coverImageAddress!: string;
  presentationAddress!: string;
  advertisementImageAddress!: string;
  name!: string;
  description!: string;
  city!: string;
  tag!: string;
  year!: number;
  links!: string[];
  registrationLink!: string | null;
  materials!: { title: string; url: string }[];
  shortDescription!: string;
  datetimeRegistrationEnds!: string;
  datetimeStarted!: string;
  datetimeFinished!: string;
  viewsCount!: number;
  likesCount!: number;
  isUserLiked!: boolean;
  isUserManager!: boolean;
  isUserMember!: boolean;

  static default(): Program {
    return {
      id: 1,
      name: "",
      description: "",
      city: "",
      imageAddress: "",
      presentationAddress: "",
      links: [],
      materials: [],
      registrationLink: null,
      coverImageAddress: "",
      advertisementImageAddress: "",
      shortDescription: "",
      datetimeRegistrationEnds: "",
      datetimeStarted: "",
      datetimeFinished: "",
      viewsCount: 1,
      tag: "",
      likesCount: 1,
      year: 0,
      isUserLiked: false,
      isUserMember: false,
      isUserManager: false,
    };
  }
}

/**
 * Схема данных программы для динамических полей
 *
 * Определяет структуру дополнительных полей программы,
 * которые могут быть настроены администратором.
 *
 * @param {string} key - Ключ поля
 * @param {object} value - Объект с типом, названием и плейсхолдером поля
 */
export class ProgramDataSchema {
  [key: string]: {
    type: "text";
    name: string;
    placeholder: string;
  };
}

/**
 * Модель тега программы
 *
 * Представляет категорию или тег программы для группировки и фильтрации.
 *
 * @param {number} id - Уникальный идентификатор тега
 * @param {string} name - Отображаемое название тега
 * @param {string} tag - Системное название тега
 */
export class ProgramTag {
  id!: number;
  name!: string;
  tag!: string;
}
