/** @format */

import { inject } from "@angular/core";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { HttpParams } from "@angular/common/http";
import { ResolveFn } from "@angular/router";
import { map } from "rxjs";
import { Project } from "@domain/project/project.model";
import { GetMyProjectsUseCase } from "@api/project/use-cases/get-my-projects.use-case";

/** Предзагружает проекты текущего пользователя. */

export const ProjectsMyResolver: ResolveFn<ApiPagination<Project>> = () => {
  const getMyProjectsUseCase = inject(GetMyProjectsUseCase);

  return getMyProjectsUseCase
    .execute(new HttpParams({ fromObject: { offset: 0, limit: 16 } }))
    .pipe(
      map(result =>
        result.ok
          ? result.value
          : {
              count: 0,
              results: [],
              next: "",
              previous: "",
            },
      ),
    );
};
