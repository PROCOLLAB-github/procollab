/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { ProgramService } from "@office/program/services/program.service";
import { Project } from "@models/project.model";
import { ApiPagination } from "@models/api-pagination.model";

export const ProgramProjectsResolver: ResolveFn<ApiPagination<Project>> = (
  route: ActivatedRouteSnapshot
) => {
  const programService = inject(ProgramService);

  return programService.getAllProjects(route.parent?.params["programId"], 0, 21);
};
