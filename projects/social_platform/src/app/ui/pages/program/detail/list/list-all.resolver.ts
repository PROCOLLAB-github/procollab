/** @format */

import { HttpParams } from "@angular/common/http";
import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn, Router } from "@angular/router";
import { ProjectRatingService } from "projects/social_platform/src/app/api/project/project-rating.service";
import { ApiPagination } from "projects/social_platform/src/app/domain/other/api-pagination.model";
import { ProjectRate } from "projects/social_platform/src/app/domain/project/project-rate";
import { catchError, EMPTY } from "rxjs";

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
  const router = inject(Router);

  return projectRatingService
    .getAll(
      route.parent?.params["programId"],
      new HttpParams({ fromObject: { offset: 0, limit: 8 } })
    )
    .pipe(
      catchError(error => {
        if (error.status === 403) {
          router.navigate([], {
            queryParams: { access: "accessDenied" },
            queryParamsHandling: "merge",
            replaceUrl: true,
          });
        }

        return EMPTY;
      })
    );
};
