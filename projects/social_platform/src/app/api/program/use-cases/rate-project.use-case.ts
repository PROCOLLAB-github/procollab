/** @format */

import { EventBus } from "@domain/shared/event-bus";

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of, tap } from "rxjs";
import { ProjectRatingRepositoryPort } from "@domain/project/ports/project-rating.repository.port";
import { ProjectRatingCriterion } from "@domain/project/project-rating-criterion";
import { fail, ok, Result } from "@domain/shared/result.type";

/** Сценарий: выставить оценку проекту (эксперт); ошибка → `rate_project_error`. */
@Injectable({ providedIn: "root" })
export class RateProjectUseCase {
  private readonly events = inject(EventBus);
  private readonly projectRatingRepositoryPort = inject(ProjectRatingRepositoryPort);

  execute(
    projectId: number,
    criteria: ProjectRatingCriterion[],
    outputVals: Record<string, string | number | boolean>,
  ): Observable<Result<void, { kind: "rate_project_error"; cause?: unknown }>> {
    const dto = this.projectRatingRepositoryPort.formValuesToDTO(criteria, outputVals);

    return this.projectRatingRepositoryPort.rate(projectId, dto).pipe(
      tap(() =>
        this.events.emit({ type: "ProgramWidgetChanged", payload: {}, occurredAt: new Date() }),
      ),
      map(() => ok<void>(undefined)),
      catchError(error => of(fail({ kind: "rate_project_error" as const, cause: error }))),
    );
  }
}
