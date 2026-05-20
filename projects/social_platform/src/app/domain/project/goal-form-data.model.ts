/** @format */

/** Входная форма цели проекта (не wire-DTO): отправляется при create/edit. */
export class GoalFormData {
  id?: number;
  title!: string;
  completionDate!: string;
  responsible!: number;
  isDone!: boolean;
}
