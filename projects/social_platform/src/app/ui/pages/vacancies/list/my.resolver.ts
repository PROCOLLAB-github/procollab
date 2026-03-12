/** @format */

import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";
import { VacancyResponse } from "projects/social_platform/src/app/domain/vacancy/vacancy-response.model";
import { map } from "rxjs";
import { GetMyVacanciesUseCase } from "projects/social_platform/src/app/api/vacancy/use-cases/get-my-vacancies.use-case";

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
  const getMyVacanciesUseCase = inject(GetMyVacanciesUseCase);

  return getMyVacanciesUseCase.execute(20, 0).pipe(map(result => (result.ok ? result.value : [])));
};
