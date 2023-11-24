/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { Observable } from "rxjs";
import { ProgramService } from "@office/program/services/program.service";
import { Project } from "@models/project.model";

export const ProgramProjectsResolver: ResolveFn<Project[]> = (
  route: ActivatedRouteSnapshot
): Observable<Project[]> => {
  const programService = inject(ProgramService);

  return programService.getAllProjects(route.parent?.params["programId"]);
};
