/** @format */

import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";
import { VacancyResponse } from "@office/models/vacancy-response.model";
import { VacancyService } from "@office/services/vacancy.service";

/**
 * Резолвер для загрузки откликов пользователя на вакансии
 *
 * Функциональность:
 * - Выполняется перед активацией маршрута '/office/vacancies/my'
 * - Загружает первые 20 откликов пользователя с offset 0
 * - Возвращает массив объектов VacancyResponse с информацией об откликах
 *
 * Использование:
 * - Данные становятся доступными в компоненте через ActivatedRoute.data['data']
 * - Позволяет отобразить список вакансий, на которые пользователь уже откликнулся
 *
 * @param {VacancyService} vacanciesService - сервис для работы с API вакансий
 * @returns {Observable<VacancyResponse[]>} Observable с массивом откликов пользователя
 *
 * Параметры запроса:
 * - limit: 20 - количество откликов на страницу
 * - offset: 0 - смещение для пагинации
 */
export const VacanciesMyResolver: ResolveFn<VacancyResponse[]> = () => {
  const vacanciesService = inject(VacancyService);

  return vacanciesService.getMyVacancies(20, 0);
};
