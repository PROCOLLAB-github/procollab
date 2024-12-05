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
  requiredExperience!: any;
  workFormat!: any;
  salary!: any;
  workSchelude!: any;
  datetimeCreated!: string;
  datetimeUpdated!: string;

  getSkillsNames(): string[] {
    return this.requiredSkills.map(s => s.name);
  }
}
