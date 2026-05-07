/** @format */

import { Project } from "../project/project.model";
import { Skill } from "../skills/skill";

/**
 * Модель вакансии в проекте
 * Представляет открытую позицию для участия в проекте
 *
 * Содержит:
 * - Описание роли и требований
 * - Необходимые навыки и опыт
 * - Условия работы (формат, график, зарплата)
 * - Связь с проектом и статус активности
 */
export class Vacancy {
  id!: number;
  role!: string;
  isActive!: boolean;
  project!: Project;
  requiredSkills!: Skill[];
  description!: string;
  requiredExperience!: string;
  workFormat!: string;
  salary!: string;
  workSchedule!: string;
  specialization?: string;
  datetimeCreated!: string;
  datetimeUpdated!: string;

  getSkillsNames(): string[] {
    return this.requiredSkills.map(s => s.name);
  }
}
