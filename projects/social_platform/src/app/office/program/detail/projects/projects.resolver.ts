/** @format */

import { inject } from "@angular/core";
import { ActivatedRoute, ActivatedRouteSnapshot, ResolveFn, Router } from "@angular/router";
import { ProgramService } from "@office/program/services/program.service";
import { Project } from "@models/project.model";
import { ApiPagination } from "@models/api-pagination.model";
import { HttpParams } from "@angular/common/http";
import { catchError, EMPTY } from "rxjs";

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
  const programService = inject(ProgramService);
  const programId = route.parent?.params["programId"];
  const router = inject(Router);

  return programService
    .getAllProjects(
      programId,
      new HttpParams({
        fromObject: { offset: 0, limit: 21 },
      })
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
