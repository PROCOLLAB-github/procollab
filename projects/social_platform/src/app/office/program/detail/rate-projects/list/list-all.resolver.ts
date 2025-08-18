/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { ApiPagination } from "@office/models/api-pagination.model";
import { ProjectRate } from "@office/program/models/project-rate";
import { ProjectRatingService } from "@office/program/services/project-rating.service";

/**
 * Резолвер для предзагрузки проектов для оценки
 *
 * Загружает первую страницу проектов программы, которые доступны
 * для оценки экспертами. Предзагрузка обеспечивает мгновенное
 * отображение данных в компоненте оценки.
 *
 * Принимает:
 * @param {ActivatedRouteSnapshot} route - Снимок маршрута с параметрами
 *
 * Использует:
 * @param {ProjectRatingService} projectRatingService - Инжектируемый сервис оценки
 *
 * Логика:
 * - Извлекает programId из родительского маршрута
 * - Загружает первые 8 проектов для оценки (skip: 0, take: 8)
 * - Не применяет дополнительные фильтры
 *
 * Возвращает:
 * @returns {Observable<ApiPagination<ProjectRate>>} Пагинированный список проектов для оценки
 *
 * Данные включают:
 * - Массив проектов с критериями оценки (results)
 * - Общее количество проектов (count)
 * - Информацию о пагинации
 *
 * Каждый проект содержит:
 * - Основную информацию проекта
 * - Массив критериев для оценки
 * - Статус оценки текущим экспертом
 * - Презентационные материалы
 *
 * Используется в:
 * Маршруте "all" для списка всех проектов программы
 */
export const ListAllResolver: ResolveFn<ApiPagination<ProjectRate>> = (
  route: ActivatedRouteSnapshot
) => {
  const projectRatingService = inject(ProjectRatingService);

  return projectRatingService.getAll(route.parent?.params["programId"], 0, 8);
};
