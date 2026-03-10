/** @format */

import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";
import { VacancyResponse } from "projects/social_platform/src/app/domain/vacancy/vacancy-response.model";
import { VacancyRepository } from "projects/social_platform/src/app/infrastructure/repository/vacancy/vacancy.repository";

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
 * @param {VacancyService} vacanciesRepository - сервис для работы с API вакансий
 * @returns {Observable<VacancyResponse[]>} Observable с массивом откликов пользователя
 *
 * Параметры запроса:
 * - limit: 20 - количество откликов на страницу
 * - offset: 0 - смещение для пагинации
 */
export const VacanciesMyResolver: ResolveFn<VacancyResponse[]> = () => {
  const vacanciesRepository = inject(VacancyRepository);

  return vacanciesRepository.getMyVacancies(20, 0);
};
