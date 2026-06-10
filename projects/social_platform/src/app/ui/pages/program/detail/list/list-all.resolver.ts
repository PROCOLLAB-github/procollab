/** @format */

import { HttpParams } from "@angular/common/http";
import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn, Router } from "@angular/router";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { ProjectRate } from "@domain/project/project-rate";
import { catchError, EMPTY, map } from "rxjs";
import { GetProjectRatingsUseCase } from "@api/program/use-cases/get-project-ratings.use-case";

/** Предзагружает проекты для оценки с критериями и пагинацией. */
export const ListAllResolver: ResolveFn<ApiPagination<ProjectRate>> = (
  route: ActivatedRouteSnapshot,
) => {
  const getProjectRatingsUseCase = inject(GetProjectRatingsUseCase);
  const router = inject(Router);

  return getProjectRatingsUseCase
    .execute(
      route.parent?.params["programId"],
      new HttpParams({ fromObject: { offset: 0, limit: 8 } }),
    )
    .pipe(
      map(result => (result.ok ? result.value : { count: 0, results: [], next: "", previous: "" })),
    )
    .pipe(
      catchError(error => {
        if (error.status === 403) {
          router.navigate([], {
            queryParams: { access: "accessDenied" },
            queryParamsHandling: "merge",
            replaceUrl: true,
          });
        }

        return EMPTY;
      }),
    );
};
