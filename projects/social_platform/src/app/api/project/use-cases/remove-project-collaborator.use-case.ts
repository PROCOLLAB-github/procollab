/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of, tap } from "rxjs";
import { ProjectCollaboratorsRepositoryPort } from "@domain/project/ports/project-collaborators.repository.port";
import { fail, ok, Result } from "@domain/shared/result.type";
import { removeProjectCollaborator } from "@domain/project/events/remove-project-collaborator.event";
import { EventBus } from "@domain/shared/event-bus";

@Injectable({ providedIn: "root" })
export class RemoveProjectCollaboratorUseCase {
  private readonly projectCollaboratorsRepositoryPort = inject(ProjectCollaboratorsRepositoryPort);
  private readonly eventBus = inject(EventBus);

  execute(
    projectId: number,
    userId: number
  ): Observable<Result<number, { kind: "remove_project_collaborator_error"; cause?: unknown }>> {
    return this.projectCollaboratorsRepositoryPort.deleteCollaborator(projectId, userId).pipe(
      tap(() => this.eventBus.emit(removeProjectCollaborator(projectId, userId))),
      map(() => ok<number>(userId)),
      catchError(error =>
        of(fail({ kind: "remove_project_collaborator_error" as const, cause: error }))
      )
    );
  }
}
