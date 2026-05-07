/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { ProjectRatingRepositoryPort } from "@domain/project/ports/project-rating.repository.port";
import { ProjectRatingCriterion } from "@domain/project/project-rating-criterion";
import { fail, ok, Result } from "@domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class RateProjectUseCase {
  private readonly projectRatingRepositoryPort = inject(ProjectRatingRepositoryPort);

  execute(
    projectId: number,
    criteria: ProjectRatingCriterion[],
    outputVals: Record<string, string | number | boolean>
  ): Observable<Result<void, { kind: "rate_project_error"; cause?: unknown }>> {
    const dto = this.projectRatingRepositoryPort.formValuesToDTO(criteria, outputVals);

    return this.projectRatingRepositoryPort.rate(projectId, dto).pipe(
      map(() => ok<void>(undefined)),
      catchError(error => of(fail({ kind: "rate_project_error" as const, cause: error })))
    );
  }
}
