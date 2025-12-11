/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { VacancyService } from "projects/social_platform/src/app/api/vacancy/vacancy.service";
import { Vacancy } from "projects/social_platform/src/app/domain/vacancy/vacancy.model";

/**
 * РЕЗОЛВЕР ДЛЯ ЗАГРУЗКИ ВАКАНСИЙ ПРОЕКТА
 *
 * Этот резолвер загружает список вакансий для конкретного проекта перед отображением компонента.
 * Используется в маршрутизации для предварительной загрузки данных.
 *
 * НАЗНАЧЕНИЕ:
 * - Загружает вакансии проекта до инициализации компонента
 * - Обеспечивает доступность данных в момент создания компонента
 * - Предотвращает отображение пустого состояния во время загрузки
 *
 * @params
 * - route: ActivatedRouteSnapshot - снимок активного маршрута с параметрами
 *
 * ИЗВЛЕКАЕМЫЕ ДАННЫЕ:
 * - projectId - ID проекта из параметров маршрута
 *
 * @returns:
 * - Observable<Vacancy[]> - массив вакансий проекта
 *
 * @params
 * - offset: 0 - начальная позиция для пагинации
 * - limit: 20 - максимальное количество вакансий
 * - projectId - ID проекта для фильтрации
 */
export const ProjectInfoResolver: ResolveFn<Vacancy[]> = (route: ActivatedRouteSnapshot) => {
  const vacancyService = inject(VacancyService); // Инъекция сервиса вакансий
  const projectId = Number(route.paramMap.get("projectId")); // Извлечение ID проекта из параметров

  // Возвращаем Observable с вакансиями проекта
  return vacancyService.getForProject(0, 20, projectId);
};
