/** @format */

import { inject } from "@angular/core";
import { map } from "rxjs";
import { GetVacanciesUseCase } from "@api/vacancy/use-cases/get-vacancies.use-case";

/**
 * Резолвер для предзагрузки списка вакансий
 * Загружает данные вакансий до активации маршрута, обеспечивая
 * мгновенное отображение контента без состояния загрузки
 *
 * @returns Observable с данными вакансий (первые 20 элементов)
 */
export const VacanciesResolver = () => {
  const getVacanciesUseCase = inject(GetVacanciesUseCase);

  // Загрузка первых 20 вакансий с нулевым смещением
  return getVacanciesUseCase
    .execute({ limit: 20, offset: 0 })
    .pipe(map(result => (result.ok ? result.value : [])));
};
