/** @format */

import { inject, Injectable } from "@angular/core";
import { ProjectProgramHttpAdapter } from "../../adapters/project/project-program-http.adapter";
import { map, Observable } from "rxjs";
import { ProjectAssign } from "../../../domain/project/project-assign.model";
import { plainToInstance } from "class-transformer";
import { Project } from "../../../domain/project/project.model";
import { ProjectNewAdditionalProgramFields } from "../../../domain/program/partner-program-fields.model";

@Injectable({ providedIn: "root" })
export class ProjectProgramRepository {
  private readonly projectProgramAdapter = inject(ProjectProgramHttpAdapter);

  assignProjectToProgram(projectId: number, partnerProgramId: number): Observable<ProjectAssign> {
    return this.projectProgramAdapter
      .assignProjectToProgram(projectId, partnerProgramId)
      .pipe(map(assign => plainToInstance(ProjectAssign, assign)));
  }

  sendNewProjectFieldsValues(
    projectId: number,
    newValues: ProjectNewAdditionalProgramFields[]
  ): Observable<Project> {
    return this.projectProgramAdapter
      .sendNewProjectFieldsValues(projectId, newValues)
      .pipe(map(fields => plainToInstance(Project, fields)));
  }
}
