/** @format */

import { Observable } from "rxjs";
import { ProjectAssign } from "../project-assign.model";
import { Project } from "../project.model";
import { ProjectNewAdditionalProgramFields } from "../../program/partner-program-fields.model";

export abstract class ProjectProgramRepositoryPort {
  abstract assignProjectToProgram(
    projectId: number,
    partnerProgramId: number
  ): Observable<ProjectAssign>;

  abstract sendNewProjectFieldsValues(
    projectId: number,
    newValues: ProjectNewAdditionalProgramFields[]
  ): Observable<Project>;
}
