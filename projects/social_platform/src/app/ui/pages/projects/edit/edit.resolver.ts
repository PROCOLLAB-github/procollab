/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { forkJoin } from "rxjs";
import { ProjectService } from "projects/social_platform/src/app/api/project/project.service";
import { InviteService } from "projects/social_platform/src/app/api/invite/invite.service";
import { Invite } from "projects/social_platform/src/app/domain/invite/invite.model";
import { Project } from "projects/social_platform/src/app/domain/project/project.model";
import { Goal } from "projects/social_platform/src/app/domain/project/goals.model";
import { Partner } from "projects/social_platform/src/app/domain/project/partner.model";
import { Resource } from "projects/social_platform/src/app/domain/project/resource.model";

/**
 * Resolver для загрузки данных редактирования проекта
 *
 * Функциональность:
 * - Загружает данные проекта по ID из параметров маршрута
 * - Получает список приглашений для проекта
 * - Объединяет данные в единый массив для компонента
 *
 * Принимает:
 * - ActivatedRouteSnapshot с параметром projectId
 *
 * Возвращает:
 * - Observable<[Project, Invite[]]> с данными:
 *   - Project: полная информация о проекте
 *   - Invite[]: массив приглашений в проект
 *
 * Используется перед загрузкой ProjectEditComponent для предварительной
 * загрузки всех необходимых данных для редактирования.
 *
 * Применяет forkJoin для параллельной загрузки данных проекта и приглашений,
 * что оптимизирует время загрузки страницы.
 */
export const ProjectEditResolver: ResolveFn<[Project, Goal[], Partner[], Resource[], Invite[]]> = (
  route: ActivatedRouteSnapshot
) => {
  const projectService = inject(ProjectService);
  const inviteService = inject(InviteService);

  const projectId = Number(route.paramMap.get("projectId"));

  return forkJoin<[Project, Goal[], Partner[], Resource[], Invite[]]>([
    projectService.getOne(projectId),
    projectService.getGoals(projectId),
    projectService.getPartners(projectId),
    projectService.getResources(projectId),
    inviteService.getByProject(projectId),
  ]);
};
