/** @format */

import { inject } from "@angular/core";
import { forkJoin, switchMap } from "rxjs";
import { Project } from "@models/project.model";
import { ProjectService } from "@services/project.service";
import { AuthService } from "@auth/services";
import { ResolveFn } from "@angular/router";
import { SubscriptionService } from "@office/services/subscription.service";
import { HttpParams } from "@angular/common/http";
import { ApiPagination } from "@office/models/api-pagination.model";

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
