/**
 * Модель участника проекта (коллаборатора)
 * Содержит основную информацию о пользователе, участвующем в проекте
 *
 * @format
 */

export class Collaborator {
  /** Уникальный идентификатор пользователя */
  userId!: number;
  /** Имя участника */
  firstName!: string;
  /** Фамилия участника */
  lastName!: string;
  /** Роль участника в проекте (например, "Разработчик", "Дизайнер") */
  role!: string;
  /** Массив ключевых навыков участника */
  skills!: {
    id: number;
    name: string;
    category: {
      id: number;
      name: string;
    };
  }[];

  /** URL аватара участника */
  avatar!: string;
}
