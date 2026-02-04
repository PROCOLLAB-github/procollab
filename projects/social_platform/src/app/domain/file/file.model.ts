/** @format */

/**
 * Модель файла в системе
 * Представляет загруженный пользователем файл
 *
 * Содержит:
 * - Метаданные файла (имя, размер, тип)
 * - Ссылку для скачивания
 * - Информацию о загрузке (пользователь, время)
 */
export class FileModel {
  datetimeUploaded!: string;
  extension!: string;
  link!: string;
  mimeType!: string;
  name!: string;
  size!: number;
  user!: number;

  static default() {
    return {
      datetimeUploaded: "string",
      extension: "string",
      link: "string",
      mimeType: "string",
      name: "string",
      size: 1,
      user: 1,
    };
  }
}
