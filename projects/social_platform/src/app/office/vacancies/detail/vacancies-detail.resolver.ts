/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot } from "@angular/router";
import { VacancyService } from "@office/services/vacancy.service";

/**
 * Резолвер для загрузки детальной информации о конкретной вакансии
 *
 * Функциональность:
 * - Извлекает ID вакансии из параметров маршрута (:vacancyId)
 * - Выполняет запрос к API для получения полной информации о вакансии
 * - Данные становятся доступными в компоненте до его инициализации
 *
 * @param {ActivatedRouteSnapshot} route - снимок активного маршрута с параметрами
 * @param {VacancyService} vacancyService - сервис для работы с API вакансий
 * @returns {Observable<Vacancy>} Observable с объектом вакансии
 *
 * Параметры:
 * - vacancyId - ID вакансии из URL параметров (например: /vacancies/123)
 */
export const VacanciesDetailResolver = (route: ActivatedRouteSnapshot) => {
  const vacancyService = inject(VacancyService);
  const vacancyId = route.params["vacancyId"];

  return vacancyService.getOne(vacancyId);
};
