/** @format */

import { inject } from "@angular/core";
import { VacancyRepository } from "../../../infrastructure/repository/vacancy/vacancy.repository";

/**
 * Резолвер для предзагрузки списка вакансий
 * Загружает данные вакансий до активации маршрута, обеспечивая
 * мгновенное отображение контента без состояния загрузки
 *
 * @returns Observable с данными вакансий (первые 20 элементов)
 */
export const VacanciesResolver = () => {
  const vacanciesRepository = inject(VacancyRepository);

  // Загрузка первых 20 вакансий с нулевым смещением
  return vacanciesRepository.getForProject(20, 0);
};
