/** @format */

import { inject, Injectable } from "@angular/core";
import { ProjectRepositoryPort } from "../../../domain/project/ports/project.repository.port";
import { catchError, map, Observable, of, tap } from "rxjs";
import { fail, ok, Result } from "../../../domain/shared/result.type";
import { EventBus } from "../../../domain/shared/event-bus";
import { projectDeleted } from "../../../domain/project/events/project-deleted.event";

@Injectable({ providedIn: "root" })
export class DeleteProjectUseCase {
  private readonly projectRepositoryPort = inject(ProjectRepositoryPort);
  private readonly eventBus = inject(EventBus);

  execute(id: number): Observable<Result<void, { kind: "unknown"; cause?: unknown }>> {
    return this.projectRepositoryPort.deleteOne(id).pipe(
      tap(() => this.eventBus.emit(projectDeleted(id))),
      map(() => ok<void>(undefined)),
      catchError(error => of(fail({ kind: "unknown" as const, cause: error })))
    );
  }
}
