/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { VacancyService } from "projects/social_platform/src/app/api/vacancy/vacancy.service";
import { VacancyResponse } from "projects/social_platform/src/app/domain/vacancy/vacancy-response.model";

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
  const vacancyService = inject(VacancyService);

  return vacancyService.responsesByProject(Number(route.parent?.paramMap.get("projectId")));
};
