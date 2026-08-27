/** @format */

export interface VacancyDto {
  id: number;
  role: string;
  specialization?: string;
  description: string;
  requiredSkillsIds: number[];
  requiredExperience: string;
  workSchedule: string;
  workFormat: string;
  salary: number | null;
  city: string | null;
}
