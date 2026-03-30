/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn, Router } from "@angular/router";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { HttpParams } from "@angular/common/http";
import { catchError, EMPTY, map } from "rxjs";
import { Project } from "@domain/project/project.model";
import { GetAllProjectsUseCase } from "@api/program/use-cases/get-all-projects.use-case";

/**
 * Резолвер для предзагрузки проектов программы
 *
 * Загружает первую страницу проектов программы перед отображением компонента.
 * Это обеспечивает мгновенное отображение данных без состояния загрузки.
 *
 * Принимает:
 * @param {ActivatedRouteSnapshot} route - Снимок маршрута с параметрами
 *
 * Использует:
 * @param {ProgramService} programService - Инжектируемый сервис программ
 *
 * Логика:
 * - Извлекает programId из родительского маршрута
 * - Загружает первые 21 проект программы (offset: 0, limit: 21)
 *
 * Возвращает:
 * @returns {Observable<ApiPagination<Project>>} Поток с пагинированными проектами
 *
 * Используется в:
 * Конфигурации маршрута projects для предзагрузки данных
 */
export const ProgramProjectsResolver: ResolveFn<ApiPagination<Project>> = (
  route: ActivatedRouteSnapshot
) => {
  const getAllProjectsUseCase = inject(GetAllProjectsUseCase);
  const programId = route.parent?.params["programId"];
  const router = inject(Router);

  return getAllProjectsUseCase
    .execute(
      programId,
      new HttpParams({
        fromObject: { offset: 0, limit: 21 },
      })
    )
    .pipe(
      map(result => (result.ok ? result.value : { count: 0, results: [], next: "", previous: "" }))
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
