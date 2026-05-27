/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot } from "@angular/router";
import { map } from "rxjs";
import { GetVacancyDetailUseCase } from "@api/vacancy/use-cases/get-vacancy-detail.use-case";

/** Предзагружает детальную информацию о вакансии. */
export const VacanciesDetailResolver = (route: ActivatedRouteSnapshot) => {
  const getVacancyDetailUseCase = inject(GetVacancyDetailUseCase);
  const vacancyId = route.params["vacancyId"];

  return getVacancyDetailUseCase
    .execute(vacancyId)
    .pipe(map(result => (result.ok ? result.value : null)));
};
