/**
 * Модель подписчика проекта
 *
 * @format
 */

export class ProjectSubscriber {
  /** Уникальный идентификатор подписчика */
  id!: number;
  /** Имя подписчика */
  firstName!: string;
  /** Фамилия подписчика */
  lastName!: string;
  /** URL аватара подписчика */
  avatar!: string;
  /** Статус онлайн подписчика (true - онлайн, false - оффлайн) */
  isOnline!: boolean;
}
