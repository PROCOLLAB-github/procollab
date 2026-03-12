/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { forkJoin, map } from "rxjs";
import { Invite } from "projects/social_platform/src/app/domain/invite/invite.model";
import { Project } from "projects/social_platform/src/app/domain/project/project.model";
import { Goal } from "projects/social_platform/src/app/domain/project/goals.model";
import { Partner } from "projects/social_platform/src/app/domain/project/partner.model";
import { Resource } from "projects/social_platform/src/app/domain/project/resource.model";
import { ProjectRepository } from "projects/social_platform/src/app/infrastructure/repository/project/project.repository";
import { ProjectGoalsRepository } from "projects/social_platform/src/app/infrastructure/repository/project/project-goals.repository";
import { ProjectPartnerRepository } from "projects/social_platform/src/app/infrastructure/repository/project/project-partner.repository";
import { ProjectResourceRepository } from "projects/social_platform/src/app/infrastructure/repository/project/project-resource.repository";
import { GetProjectInvitesUseCase } from "projects/social_platform/src/app/api/invite/use-cases/get-project-invites.use-case";

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
  const projectRepository = inject(ProjectRepository);
  const projectGoalsRepository = inject(ProjectGoalsRepository);
  const projectPartnersRepository = inject(ProjectPartnerRepository);
  const projectResourceRepository = inject(ProjectResourceRepository);
  const getProjectInvitesUseCase = inject(GetProjectInvitesUseCase);

  const projectId = Number(route.paramMap.get("projectId"));

  return forkJoin<[Project, Goal[], Partner[], Resource[], Invite[]]>([
    projectRepository.getOne(projectId),
    projectGoalsRepository.fetchAll(projectId),
    projectPartnersRepository.fetchAll(projectId),
    projectResourceRepository.fetchAll(projectId),
    getProjectInvitesUseCase
      .execute(projectId)
      .pipe(map(result => (result.ok ? result.value : []))),
  ]);
};
