/** @format */

class ResponsibleInfo {
  id!: number;
  firstName!: string;
  lastName!: string;
  avatar!: string | null;
}

export interface GoalDto {
  id: number;
  project: number;
  title: string;
  completionDate: string;
  responsible: number;
  responsibleInfo: ResponsibleInfo;
  isDone: boolean;
}

export class GoalFormData {
  id?: number;
  title!: string;
  completionDate!: string;
  responsible!: number;
  isDone!: boolean;
}
