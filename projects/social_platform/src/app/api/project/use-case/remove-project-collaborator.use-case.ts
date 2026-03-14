/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { ProjectCollaboratorsRepositoryPort } from "../../../domain/project/ports/project-collaborators.repository.port";
import { fail, ok, Result } from "../../../domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class RemoveProjectCollaboratorUseCase {
  private readonly projectCollaboratorsRepositoryPort = inject(ProjectCollaboratorsRepositoryPort);

  execute(
    projectId: number,
    userId: number
  ): Observable<Result<number, { kind: "remove_project_collaborator_error"; cause?: unknown }>> {
    return this.projectCollaboratorsRepositoryPort.deleteCollaborator(projectId, userId).pipe(
      map(() => ok<number>(userId)),
      catchError(error =>
        of(fail({ kind: "remove_project_collaborator_error" as const, cause: error }))
      )
    );
  }
}
