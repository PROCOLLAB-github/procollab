/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { ProjectCollaboratorsRepositoryPort } from "@domain/project/ports/project-collaborators.repository.port";
import { fail, ok, Result } from "@domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class LeaveProjectUseCase {
  private readonly projectCollaboratorsRepositoryPort = inject(ProjectCollaboratorsRepositoryPort);

  execute(
    projectId: number
  ): Observable<Result<void, { kind: "leave_project_error"; cause?: unknown }>> {
    return this.projectCollaboratorsRepositoryPort.deleteLeave(projectId).pipe(
      map(() => ok<void>(undefined)),
      catchError(error => of(fail({ kind: "leave_project_error" as const, cause: error })))
    );
  }
}
