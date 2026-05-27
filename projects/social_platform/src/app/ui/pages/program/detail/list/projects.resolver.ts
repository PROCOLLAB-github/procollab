/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn, Router } from "@angular/router";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { HttpParams } from "@angular/common/http";
import { catchError, EMPTY, map } from "rxjs";
import { Project } from "@domain/project/project.model";
import { GetAllProjectsUseCase } from "@api/program/use-cases/get-all-projects.use-case";
import { CreateProgramFiltersUseCase } from "@api/program/use-cases/create-program-filters.use-case";

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
  const createProgramFiltersUseCase = inject(CreateProgramFiltersUseCase);
  const programId = route.parent?.params["programId"];
  const router = inject(Router);
  const qp = route.queryParams;
  const filters: Record<string, any> = {};
  Object.keys(qp).forEach(k => {
    if (qp[k] !== undefined && qp[k] !== "" && k !== "search") {
      filters[k] = Array.isArray(qp[k]) ? qp[k] : [qp[k]];
    }
  });

  const params = new HttpParams({ fromObject: { offset: 0, limit: 21 } });
  const req$ =
    Object.keys(filters).length > 0
      ? createProgramFiltersUseCase.execute(programId, filters, params)
      : getAllProjectsUseCase.execute(programId, params);
  return req$
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
