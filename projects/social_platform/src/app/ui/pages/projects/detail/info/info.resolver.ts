/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { Vacancy } from "@domain/vacancy/vacancy.model";
import { map, of } from "rxjs";
import { GetVacanciesUseCase } from "@api/vacancy/use-cases/get-vacancies.use-case";
import { GetProgramLinkFieldsUseCase } from "@api/project/use-cases/get-program-link-fields.use-case";
import type { ProgramFieldAnswer } from "@domain/project/program-link-fields.model";

/** Предзагружает вакансии проекта. */
export const ProjectInfoResolver: ResolveFn<Vacancy[]> = (route: ActivatedRouteSnapshot) => {
  const getVacanciesUseCase = inject(GetVacanciesUseCase);
  const projectId = Number(route.paramMap.get("projectId")); // Извлечение ID проекта из параметров

  // Возвращаем Observable с вакансиями проекта
  return getVacanciesUseCase
    .execute({ limit: 20, offset: 0, projectId })
    .pipe(map(result => (result.ok ? result.value : [])));
};

export const ProjectProgramAnswersResolver: ResolveFn<ProgramFieldAnswer[]> = route => {
  const projectId = Number(route.paramMap.get("projectId"));
  const programLinkId = Number(route.queryParamMap.get("programLinkId"));
  if (
    !Number.isSafeInteger(projectId) ||
    projectId < 1 ||
    !Number.isSafeInteger(programLinkId) ||
    programLinkId < 1
  ) {
    return of([]);
  }

  return inject(GetProgramLinkFieldsUseCase)
    .execute(programLinkId)
    .pipe(
      map(result =>
        result.ok &&
        result.value.projectId === projectId &&
        result.value.programLinkId === programLinkId
          ? result.value.fields
          : [],
      ),
    );
};
