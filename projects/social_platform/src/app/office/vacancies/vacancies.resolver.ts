/** @format */

import { inject } from "@angular/core";
import { VacancyService } from "@office/services/vacancy.service";

/**
 * Резолвер для предзагрузки списка вакансий
 * Загружает данные вакансий до активации маршрута, обеспечивая
 * мгновенное отображение контента без состояния загрузки
 *
 * @returns Observable с данными вакансий (первые 20 элементов)
 */
export const VacanciesResolver = () => {
  const vacanciesService = inject(VacancyService);

  // Загрузка первых 20 вакансий с нулевым смещением
  return vacanciesService.getForProject(20, 0);
};
