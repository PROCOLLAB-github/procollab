/** @format */

import { inject } from "@angular/core";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { HttpParams } from "@angular/common/http";
import { ResolveFn } from "@angular/router";
import { map } from "rxjs";
import { Project } from "@domain/project/project.model";
import { GetAllProjectsUseCase } from "@api/project/use-cases/get-all-projects.use-case";

/** Предзагружает список всех проектов. */
export const ProjectsAllResolver: ResolveFn<ApiPagination<Project>> = () => {
  const getAllProjectsUseCase = inject(GetAllProjectsUseCase);

  return getAllProjectsUseCase
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
