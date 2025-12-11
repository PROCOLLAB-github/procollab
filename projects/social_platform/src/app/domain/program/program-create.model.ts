/** @format */

/**
 * Модель для создания новой программы
 *
 * Содержит все необходимые поля для создания программы в системе.
 * Используется при отправке POST запроса на создание программы.
 *
 * Свойства:
 * @param {string} name - Название программы
 * @param {string} imageAddress - URL изображения программы
 * @param {string} datetimeRegistrationEnd - Дата и время окончания регистрации (ISO строка)
 * @param {string} datetimeStarted - Дата и время начала программы (ISO строка)
 * @param {string} datetimeFinished - Дата и время окончания программы (ISO строка)
 */
export class ProgramCreate {
  name!: string;
  imageAddress!: string;
  datetimeRegistrationEnd!: string;
  datetimeStarted!: string;
  datetimeFinished!: string;
}
