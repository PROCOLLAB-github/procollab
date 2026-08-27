/** @format */

export interface CreateVacancyDto {
  role: string;
  requiredSkillsIds?: number[];
  description?: string;
  requiredExperience: string;
  workFormat: string;
  city: string | null;
  workSchedule: string;
  specialization?: string;
  salary: number | null;
}
