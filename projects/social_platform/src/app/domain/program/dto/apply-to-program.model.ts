/** @format */

import { Project } from "@domain/project/project.model";
import { ProjectNewAdditionalProgramFields } from "../partner-program-fields.model";

export interface ApplyToProgramDTO {
  project: Project;
  programFieldValues: ProjectNewAdditionalProgramFields[];
}
