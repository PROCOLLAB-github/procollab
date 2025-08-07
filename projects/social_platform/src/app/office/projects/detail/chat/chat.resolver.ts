/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { Project } from "@models/project.model";
import { ProjectService } from "@services/project.service";

/**
 * Резолвер для загрузки данных проекта для чата
 *
 * Принимает:
 * - ActivatedRouteSnapshot с родительским параметром projectId
 *
 * Возвращает:
 * - Observable<Project> - данные проекта для отображения в чате
 *
 * Использует:
 * - ProjectService для получения данных проекта по ID
 */
export const ProjectChatResolver: ResolveFn<Project> = (route: ActivatedRouteSnapshot) => {
  const projectService = inject(ProjectService);
  const id = Number(route.parent?.paramMap.get("projectId"));

  return projectService.getOne(id);
};
