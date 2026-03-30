/** @format */

import { ProjectDto } from "@infrastructure/adapters/project/dto/project.dto";

export interface UpdateFormCommand {
  id: number;
  data: Partial<ProjectDto>;
}
