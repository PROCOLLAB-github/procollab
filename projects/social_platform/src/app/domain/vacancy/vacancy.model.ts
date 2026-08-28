/** @format */

import { Project } from "../project/project.model";
import { Skill } from "../skills/skill.model";

/** Модель вакансии в проекте */
export class Vacancy {
  id!: number;
  role!: string;
  isActive!: boolean;
  project!: Project;
  requiredSkills!: Skill[];
  description!: string;
  requiredExperience!: string;
  workFormat!: string;
  city!: string | null;
  salary!: string;
  workSchedule!: string;
  specialization?: string;
  datetimeCreated!: string;
  datetimeUpdated!: string;
  hasResponded = false;
  canRespond = false;
  canManageResponses = false;
  responseStatus: "pending" | "accepted" | "rejected" | null = null;

  getSkillsNames(): string[] {
    return this.requiredSkills.map(s => s.name);
  }
}
