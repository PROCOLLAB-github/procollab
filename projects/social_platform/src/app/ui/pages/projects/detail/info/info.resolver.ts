/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { Vacancy } from "@domain/vacancy/vacancy.model";
import { map } from "rxjs";
import { GetVacanciesUseCase } from "@api/vacancy/use-cases/get-vacancies.use-case";

/** Предзагружает вакансии проекта. */
export const ProjectInfoResolver: ResolveFn<Vacancy[]> = (route: ActivatedRouteSnapshot) => {
  const getVacanciesUseCase = inject(GetVacanciesUseCase);
  const projectId = Number(route.paramMap.get("projectId")); // Извлечение ID проекта из параметров

  // Возвращаем Observable с вакансиями проекта
  return getVacanciesUseCase
    .execute({ limit: 20, offset: 0, projectId })
    .pipe(map(result => (result.ok ? result.value : [])));
};
