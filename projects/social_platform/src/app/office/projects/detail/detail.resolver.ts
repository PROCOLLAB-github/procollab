/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { forkJoin, of, switchMap, tap } from "rxjs";
import { ProjectService } from "@services/project.service";
import { Project } from "@models/project.model";
import { SubscriptionService } from "@office/services/subscription.service";
import { ProjectSubscriber } from "@office/models/project-subscriber.model";
import { ProjectDataService } from "./services/project-data.service";

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
  const projectService = inject(ProjectService);
  const subscriptionService = inject(SubscriptionService);
  const projectDataService = inject(ProjectDataService);

  return projectService.getOne(Number(route.paramMap.get("projectId"))).pipe(
    tap(project => projectDataService.setProject(project)),
    switchMap(project => {
      return forkJoin([of(project), subscriptionService.getSubscribers(project.id)]);
    })
  );
};
