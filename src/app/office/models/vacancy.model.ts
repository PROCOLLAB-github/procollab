/** @format */
import { Project } from "@models/project.model";

export class Vacancy {
  id!: number;
  role!: string;
  isActive!: boolean;
  project!: Project;
  requiredSkills!: string[];
  description!: string;
  datetimeCreated!: string;
  datetimeUpdated!: string;
}
