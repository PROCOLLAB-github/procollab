/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { ProjectService } from "projects/social_platform/src/app/api/project/project.service";
import { tap } from "rxjs";
import { Project } from "projects/social_platform/src/app/domain/project/project.model";
import { ProjectsDetailUIInfoService } from "projects/social_platform/src/app/api/project/facades/detail/ui/projects-detail-ui.service";

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
  const projectsDetailUIInfoService = inject(ProjectsDetailUIInfoService);
  const id = Number(route.parent?.paramMap.get("projectId"));

  return projectService
    .getOne(id)
    .pipe(tap(profile => projectsDetailUIInfoService.applySetProject(profile)));
};
