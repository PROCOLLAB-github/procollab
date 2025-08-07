/**
 * Модель подписчика проекта
 * Представляет пользователя, который подписан на обновления проекта
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
