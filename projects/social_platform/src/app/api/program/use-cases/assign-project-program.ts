/** @format */

import { inject, Injectable } from "@angular/core";
import { ProjectProgramRepositoryPort } from "@domain/project/ports/project-program.repository.port";
import { catchError, map, Observable, of } from "rxjs";
import { fail, ok, Result } from "@domain/shared/result.type";
import { ProjectAssign } from "@domain/project/project-assign.model";

@Injectable({ providedIn: "root" })
export class AssignProjectProgramUseCase {
  private readonly projectProgramRepositoryPort = inject(ProjectProgramRepositoryPort);

  execute(
    projectId: number,
    partnerProgramId: number
  ): Observable<Result<ProjectAssign, { kind: "unknown"; cause?: unknown }>> {
    return this.projectProgramRepositoryPort
      .assignProjectToProgram(projectId, partnerProgramId)
      .pipe(
        map(project => ok<ProjectAssign>(project)),
        catchError(error => of(fail({ kind: "unknown" as const, cause: error })))
      );
  }
}
