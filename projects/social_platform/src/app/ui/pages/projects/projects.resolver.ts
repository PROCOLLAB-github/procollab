/** @format */

import { inject, Injector } from "@angular/core";
import { forkJoin, map, switchMap } from "rxjs";
import { ResolveFn } from "@angular/router";
import { HttpParams } from "@angular/common/http";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { Project } from "@domain/project/project.model";
import { GetAllProjectsUseCase } from "@api/project/use-cases/get-all-projects.use-case";
import { GetMyProjectsUseCase } from "@api/project/use-cases/get-my-projects.use-case";
import { GetProjectSubscriptionsUseCase } from "@api/project/use-cases/get-project-subscriptions.use-case";
import { AuthInfoService } from "@api/auth/facades/auth-info.service";
import { ProfileInfoService } from "@api/profile/facades/profile-info.service";
import { toObservable } from "@angular/core/rxjs-interop";

/** Resolver: предзагружает количество проектов (my/all/subs). */

export interface DashboardProjectsData {
  all: ApiPagination<Project>;
  my: ApiPagination<Project>;
  subs: ApiPagination<Project>;
}

export const ProjectsResolver: ResolveFn<DashboardProjectsData> = () => {
  const injector = inject(Injector);
  const profileInfoService = inject(ProfileInfoService);
  const getAllProjectsUseCase = inject(GetAllProjectsUseCase);
  const getMyProjectsUseCase = inject(GetMyProjectsUseCase);
  const getProjectSubscriptionsUseCase = inject(GetProjectSubscriptionsUseCase);
  const emptyProjectsPage = (): ApiPagination<Project> => ({
    count: 0,
    next: "",
    previous: "",
    results: [],
  });

  return toObservable(profileInfoService.profile, { injector }).pipe(
    switchMap(user =>
      forkJoin({
        all: getAllProjectsUseCase
          .execute(new HttpParams({ fromObject: { offset: 0, limit: 16 } }))
          .pipe(map(result => (result.ok ? result.value : emptyProjectsPage()))),
        my: getMyProjectsUseCase
          .execute(new HttpParams({ fromObject: { offset: 0, limit: 16 } }))
          .pipe(map(result => (result.ok ? result.value : emptyProjectsPage()))),
        subs: getProjectSubscriptionsUseCase
          .execute(user!.id)
          .pipe(map(result => (result.ok ? result.value : emptyProjectsPage()))),
      })
    )
  );
};
