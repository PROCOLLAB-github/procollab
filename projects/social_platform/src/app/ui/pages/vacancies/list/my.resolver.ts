/** @format */

import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";
import { VacancyResponse } from "@domain/vacancy/vacancy-response.model";
import { map } from "rxjs";
import { GetMyVacanciesUseCase } from "@api/vacancy/use-cases/get-my-vacancies.use-case";

/** Предзагружает отклики пользователя на вакансии. */
export const VacanciesMyResolver: ResolveFn<VacancyResponse[]> = () => {
  const getMyVacanciesUseCase = inject(GetMyVacanciesUseCase);

  return getMyVacanciesUseCase.execute(20, 0).pipe(map(result => (result.ok ? result.value : [])));
};
