/** @format */

import { inject } from "@angular/core";
import { forkJoin, switchMap } from "rxjs";
import { ResolveFn } from "@angular/router";
import { SubscriptionHttpAdapter } from "projects/social_platform/src/app/infrastructure/adapters/subscription/subscription-http.adapter";
import { HttpParams } from "@angular/common/http";
import { ApiPagination } from "projects/social_platform/src/app/domain/other/api-pagination.model";
import { Project } from "../../../domain/project/project.model";
import { ProjectRepository } from "../../../infrastructure/repository/project/project.repository";
import { AuthRepository } from "../../../infrastructure/repository/auth/auth.repository";

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
  const projectRepository = inject(ProjectRepository);
  const authRepository = inject(AuthRepository);
  const subscriptionService = inject(SubscriptionHttpAdapter);

  return authRepository.profile.pipe(
    switchMap(user =>
      forkJoin({
        all: projectRepository.getAll(new HttpParams({ fromObject: { limit: 16 } })),
        my: projectRepository.getMy(new HttpParams({ fromObject: { limit: 16 } })),
        subs: subscriptionService.getSubscriptions(user.id),
      })
    )
  );
};
