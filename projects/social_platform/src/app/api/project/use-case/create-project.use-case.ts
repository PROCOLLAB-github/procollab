/** @format */

import { inject, Injectable } from "@angular/core";
import { ProjectRepositoryPort } from "../../../domain/project/ports/project.repository.port";
import { catchError, map, Observable, of, tap } from "rxjs";
import { fail, ok, Result } from "../../../domain/shared/result.type";
import { Project } from "../../../domain/project/project.model";
import { EventBus } from "../../../domain/shared/event-bus";
import { projectCreated } from "../../../domain/project/events/project-created.event";

@Injectable({ providedIn: "root" })
export class CreateProjectUseCase {
  private readonly projectRepositoryPort = inject(ProjectRepositoryPort);
  private readonly eventBus = inject(EventBus);

  execute(): Observable<Result<Project, { kind: "unknown" }>> {
    return this.projectRepositoryPort.postOne().pipe(
      tap(project => this.eventBus.emit(projectCreated(project))),
      map(project => ok<Project>(project)),
      catchError(() => of(fail({ kind: "unknown" as const })))
    );
  }
}
