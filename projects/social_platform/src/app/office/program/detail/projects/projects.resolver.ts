/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { ProgramService } from "@office/program/services/program.service";
import { Project } from "@models/project.model";
import { ApiPagination } from "@models/api-pagination.model";
import { HttpParams } from "@angular/common/http";

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
  return programService.getAllProjects(
    new HttpParams({
      fromObject: { partner_program: route.parent?.params["programId"], offset: 0, limit: 21 },
    })
  );
};
