/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { VacancyResponse } from "@domain/vacancy/vacancy-response.model";
import { map } from "rxjs";
import { GetProjectResponsesUseCase } from "@api/vacancy/use-cases/get-project-responses.use-case";

/**
 * Резолвер для загрузки откликов на вакансии проекта
 *
 * Принимает:
 * - ActivatedRouteSnapshot с родительским параметром projectId
 *
 * Возвращает:
 * - Observable<VacancyResponse[]> - список откликов на вакансии проекта
 *
 * Использует:
 * - VacancyService для получения откликов по ID проекта
 */
export const ProjectResponsesResolver: ResolveFn<VacancyResponse[]> = (
  route: ActivatedRouteSnapshot
) => {
  const getProjectResponsesUseCase = inject(GetProjectResponsesUseCase);

  return getProjectResponsesUseCase
    .execute(Number(route.parent?.paramMap.get("projectId")))
    .pipe(map(result => (result.ok ? result.value : [])));
};
