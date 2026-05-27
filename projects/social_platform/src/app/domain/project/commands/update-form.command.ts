/** @format */

import { Project } from "@domain/project/project.model";

/** Команда: что обновить у проекта с указанным id. */
export interface UpdateFormCommand {
  id: number;
  data: Partial<Project>;
}
