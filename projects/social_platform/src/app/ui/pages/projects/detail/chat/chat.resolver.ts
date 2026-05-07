/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { of, switchMap } from "rxjs";
import { Project } from "@domain/project/project.model";
import { ProjectsDetailUIInfoService } from "@api/project/facades/detail/ui/projects-detail-ui.service";
import { GetProjectUseCase } from "@api/project/use-cases/get-project.use-case";

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
  const getProjectUseCase = inject(GetProjectUseCase);
  const projectsDetailUIInfoService = inject(ProjectsDetailUIInfoService);
  const id = Number(route.parent?.paramMap.get("projectId"));

  return getProjectUseCase.execute(id).pipe(
    switchMap(result => {
      if (!result.ok) {
        return of(new Project());
      }

      const project = result.value;
      projectsDetailUIInfoService.applySetProject(project);
      return of(project);
    })
  );
};
