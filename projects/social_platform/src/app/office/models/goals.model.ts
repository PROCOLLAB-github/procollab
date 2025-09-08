/**
 * Основная модель целей проекта
 * Представляет цели со всей необходимой информацией
 *
 * Goal содержит:
 * - Основную информацию (проект, ответственного, название и дату)
 * - выполнена или нет цель
 * - полную информацию о человеке, который ответсвенен за цель
 *
 * @format
 */

class responsibleInfo {
  id!: number;
  firstName!: string;
  lastName!: string;
  avatar!: string | null;
}

export class Goal {
  id!: number;
  project!: number;
  title!: string;
  completionDate!: string;
  responsibleId!: number;
  responsibleInfo!: responsibleInfo;
  isDone!: boolean;
}
