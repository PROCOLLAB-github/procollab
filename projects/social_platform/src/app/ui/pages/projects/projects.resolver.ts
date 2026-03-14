/** @format */

import { inject } from "@angular/core";
import { forkJoin, map, switchMap } from "rxjs";
import { ResolveFn } from "@angular/router";
import { HttpParams } from "@angular/common/http";
import { ApiPagination } from "projects/social_platform/src/app/domain/other/api-pagination.model";
import { Project } from "../../../domain/project/project.model";
import { AuthRepository } from "../../../infrastructure/repository/auth/auth.repository";
import { GetAllProjectsUseCase } from "projects/social_platform/src/app/api/project/use-case/get-all-projects.use-case";
import { GetMyProjectsUseCase } from "projects/social_platform/src/app/api/project/use-case/get-my-projects.use-case";
import { GetProjectSubscriptionsUseCase } from "projects/social_platform/src/app/api/project/use-case/get-project-subscriptions.use-case";

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
  const authRepository = inject(AuthRepository);
  const getAllProjectsUseCase = inject(GetAllProjectsUseCase);
  const getMyProjectsUseCase = inject(GetMyProjectsUseCase);
  const getProjectSubscriptionsUseCase = inject(GetProjectSubscriptionsUseCase);
  const emptyProjectsPage = (): ApiPagination<Project> => ({
    count: 0,
    next: "",
    previous: "",
    results: [],
  });

  return authRepository.profile.pipe(
    switchMap(user =>
      forkJoin({
        all: getAllProjectsUseCase
          .execute(new HttpParams({ fromObject: { limit: 16 } }))
          .pipe(map(result => (result.ok ? result.value : emptyProjectsPage()))),
        my: getMyProjectsUseCase
          .execute(new HttpParams({ fromObject: { limit: 16 } }))
          .pipe(map(result => (result.ok ? result.value : emptyProjectsPage()))),
        subs: getProjectSubscriptionsUseCase
          .execute(user.id)
          .pipe(map(result => (result.ok ? result.value : emptyProjectsPage()))),
      })
    )
  );
};
