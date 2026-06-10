/** @format */

import { inject } from "@angular/core";
import { map } from "rxjs";
import { GetVacanciesUseCase } from "@api/vacancy/use-cases/get-vacancies.use-case";

/** Предзагружает список вакансий. */
export const VacanciesResolver = () => {
  const getVacanciesUseCase = inject(GetVacanciesUseCase);

  // Загрузка первых 20 вакансий с нулевым смещением
  return getVacanciesUseCase
    .execute({ limit: 20, offset: 0 })
    .pipe(map(result => (result.ok ? result.value : [])));
};
