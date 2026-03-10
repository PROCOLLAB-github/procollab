/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { forkJoin, of, switchMap, tap } from "rxjs";
import { SubscriptionHttpAdapter } from "projects/social_platform/src/app/infrastructure/adapters/subscription/subscription-http.adapter";
import { ProjectSubscriber } from "projects/social_platform/src/app/domain/project/project-subscriber.model";
import { Project } from "projects/social_platform/src/app/domain/project/project.model";
import { ProjectsDetailUIInfoService } from "projects/social_platform/src/app/api/project/facades/detail/ui/projects-detail-ui.service";
import { ProjectRepository } from "projects/social_platform/src/app/infrastructure/repository/project/project.repository";

/**
 * Резолвер для загрузки данных проекта и его подписчиков
 *
 * Принимает:
 * - ActivatedRouteSnapshot с параметром projectId
 *
 * Возвращает:
 * - Observable<[Project, ProjectSubscriber[]]> - кортеж с данными проекта и списком подписчиков
 *
 * Использует:
 * - ProjectService для получения данных проекта
 * - SubscriptionService для получения списка подписчиков
 */
export const ProjectDetailResolver: ResolveFn<[Project, ProjectSubscriber[]]> = (
  route: ActivatedRouteSnapshot
) => {
  const projectRepository = inject(ProjectRepository);
  const subscriptionService = inject(SubscriptionHttpAdapter);
  const projectsDetailUIInfoService = inject(ProjectsDetailUIInfoService);

  return projectRepository.getOne(Number(route.paramMap.get("projectId"))).pipe(
    tap(project => projectsDetailUIInfoService.applySetProject(project)),
    switchMap(project => {
      return forkJoin([of(project), subscriptionService.getSubscribers(project.id)]);
    })
  );
};
