/** @format */

export interface CreateVacancyDto {
  role: string;
  requiredSkillsIds?: number[];
  description?: string;
  requiredExperience: string;
  workFormat: string;
  workSchedule: string;
  specialization?: string;
  salary: number | null;
}
