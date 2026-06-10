/**
 * Модель новости/статьи
 *
 * @format
 */

export class NewsArticle {
  /** Уникальный идентификатор новости */
  id!: number;
  /** URL обложки новости */
  coverUrl!: string;
  /** Заголовок новости */
  title!: string;
  /** Полный текст новости (опционально) */
  text?: string;
  /** Краткое описание новости для превью */
  shortText!: string;
}
