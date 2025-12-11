/** @format */

import { inject } from "@angular/core";
import { forkJoin, switchMap } from "rxjs";
import { ProjectService } from "projects/social_platform/src/app/api/project/project.service";
import { ResolveFn } from "@angular/router";
import { SubscriptionService } from "projects/social_platform/src/app/api/subsriptions/subscription.service";
import { HttpParams } from "@angular/common/http";
import { ApiPagination } from "projects/social_platform/src/app/domain/other/api-pagination.model";
import { Project } from "../../../domain/project/project.model";
import { AuthService } from "../../../api/auth";

/**
 * Resolver для загрузки данных о количестве проектов
 *
 * Функциональность:
 * - Загружает количество проектов пользователя в разных категориях
 * - Получает количество подписок пользователя
 * - Объединяет данные в единый объект ProjectCount
 *
 * Принимает:
 * - Не принимает параметры (использует текущего пользователя)
 *
 * Возвращает:
 * - Observable<ProjectCount> с данными:
 *   - my: количество собственных проектов
 *   - all: общее количество проектов в системе
 *   - subs: количество подписок пользователя
 *
 * Используется перед загрузкой ProjectsComponent для предварительной
 * загрузки необходимых данных.
 */

export interface DashboardProjectsData {
  all: ApiPagination<Project>;
  my: ApiPagination<Project>;
  subs: ApiPagination<Project>;
}

export const ProjectsResolver: ResolveFn<DashboardProjectsData> = () => {
  const projectService = inject(ProjectService);
  const authService = inject(AuthService);
  const subscriptionService = inject(SubscriptionService);

  return authService.profile.pipe(
    switchMap(user =>
      forkJoin({
        all: projectService.getAll(new HttpParams({ fromObject: { limit: 16 } })),
        my: projectService.getMy(new HttpParams({ fromObject: { limit: 16 } })),
        subs: subscriptionService.getSubscriptions(user.id),
      })
    )
  );
};
