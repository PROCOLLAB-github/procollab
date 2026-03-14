/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { ProjectProgramRepositoryPort } from "../../../domain/project/ports/project-program.repository.port";
import { ProjectNewAdditionalProgramFields } from "../../../domain/program/partner-program-fields.model";
import { Project } from "../../../domain/project/project.model";
import { fail, ok, Result } from "../../../domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class SendProjectAdditionalFieldsUseCase {
  private readonly projectProgramRepositoryPort = inject(ProjectProgramRepositoryPort);

  execute(
    projectId: number,
    newValues: ProjectNewAdditionalProgramFields[]
  ): Observable<
    Result<Project, { kind: "send_project_additional_fields_error"; cause?: unknown }>
  > {
    return this.projectProgramRepositoryPort.sendNewProjectFieldsValues(projectId, newValues).pipe(
      map(project => ok<Project>(project)),
      catchError(error =>
        of(fail({ kind: "send_project_additional_fields_error" as const, cause: error }))
      )
    );
  }
}
