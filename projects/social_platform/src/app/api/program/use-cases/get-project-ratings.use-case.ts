/** @format */

import { HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { ProjectRatingRepositoryPort } from "@domain/project/ports/project-rating.repository.port";
import { ProjectRate } from "@domain/project/project-rate";
import { fail, ok, Result } from "@domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class GetProjectRatingsUseCase {
  private readonly projectRatingRepositoryPort = inject(ProjectRatingRepositoryPort);

  execute(
    programId: number,
    params?: HttpParams
  ): Observable<
    Result<ApiPagination<ProjectRate>, { kind: "get_project_ratings_error"; cause?: unknown }>
  > {
    return this.projectRatingRepositoryPort.getAll(programId, params).pipe(
      map(rating => ok<ApiPagination<ProjectRate>>(rating)),
      catchError(error => of(fail({ kind: "get_project_ratings_error" as const, cause: error })))
    );
  }
}
