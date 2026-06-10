/**
 * Модель целей проекта
 *
 * @format
 */

class ResponsibleInfo {
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
  responsible!: number;
  responsibleInfo!: ResponsibleInfo;
  isDone!: boolean;
}
