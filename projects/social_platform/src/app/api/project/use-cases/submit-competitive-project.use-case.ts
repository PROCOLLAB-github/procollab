/** @format */

import { EventBus } from "@domain/shared/event-bus";

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of, tap } from "rxjs";
import { ProgramRepositoryPort } from "@domain/program/ports/program.repository.port";
import { Project } from "@domain/project/project.model";
import { fail, ok, Result } from "@domain/shared/result.type";

/** Сценарий: подать проект на конкурс программы; ошибка → `submit_competitive_project_error`. */
@Injectable({ providedIn: "root" })
export class SubmitCompetitiveProjectUseCase {
  private readonly events = inject(EventBus);
  private readonly programRepositoryPort = inject(ProgramRepositoryPort);

  execute(
    relationId: number,
  ): Observable<Result<Project, { kind: "submit_competitive_project_error"; cause?: unknown }>> {
    return this.programRepositoryPort.submitCompettetiveProject(relationId).pipe(
      tap(() =>
        this.events.emit({ type: "ProgramWidgetChanged", payload: {}, occurredAt: new Date() }),
      ),
      map(project => ok<Project>(project)),
      catchError(error =>
        of(fail({ kind: "submit_competitive_project_error" as const, cause: error })),
      ),
    );
  }
}
