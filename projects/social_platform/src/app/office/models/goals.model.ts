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

class ResponsibleInfo {
  id!: number;
  firstName!: string;
  lastName!: string;
  avatar!: string | null;
}

export class GoalPostForm {
  title!: string;
  completionDate!: string;
  responsible!: number;
  isDone!: boolean;
}

export class Goal {
  id!: number;
  project!: number;
  title!: string;
  completionDate!: string;
  responsible!: number;
  responsibleInfo!: ResponsibleInfo;
  isDone!: boolean;
}
