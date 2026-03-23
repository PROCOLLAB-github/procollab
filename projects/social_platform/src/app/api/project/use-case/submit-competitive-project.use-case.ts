/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { ProgramRepositoryPort } from "../../../domain/program/ports/program.repository.port";
import { Project } from "../../../domain/project/project.model";
import { fail, ok, Result } from "../../../domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class SubmitCompetitiveProjectUseCase {
  private readonly programRepositoryPort = inject(ProgramRepositoryPort);

  execute(
    relationId: number
  ): Observable<Result<Project, { kind: "submit_competitive_project_error"; cause?: unknown }>> {
    return this.programRepositoryPort.submitCompettetiveProject(relationId).pipe(
      map(project => ok<Project>(project)),
      catchError(error =>
        of(fail({ kind: "submit_competitive_project_error" as const, cause: error }))
      )
    );
  }
}
