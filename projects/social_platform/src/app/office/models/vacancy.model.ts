/** @format */
import { Project } from "@models/project.model";
import { Skill } from "./skill";

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
  datetimeCreated!: string;
  datetimeUpdated!: string;

  getSkillsNames(): string[] {
    return this.requiredSkills.map(s => s.name);
  }
}
