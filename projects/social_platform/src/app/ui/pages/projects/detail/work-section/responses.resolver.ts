/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { VacancyResponse } from "@domain/vacancy/vacancy-response.model";
import { map } from "rxjs";
import { GetProjectResponsesUseCase } from "@api/vacancy/use-cases/get-project-responses.use-case";

/** Предзагружает отклики на вакансии проекта. */
export const ProjectResponsesResolver: ResolveFn<VacancyResponse[]> = (
  route: ActivatedRouteSnapshot,
) => {
  const getProjectResponsesUseCase = inject(GetProjectResponsesUseCase);

  return getProjectResponsesUseCase
    .execute(Number(route.parent?.paramMap.get("projectId")))
    .pipe(map(result => (result.ok ? result.value : [])));
};
