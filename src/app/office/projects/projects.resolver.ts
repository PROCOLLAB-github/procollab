/** @format */

import { inject } from "@angular/core";
import { Observable, take, noop } from "rxjs";
import { ProjectCount } from "@models/project.model";
import { ProjectService } from "@services/project.service";
import { AuthService } from "@auth/services";
import { ResolveFn } from "@angular/router";

export const ProjectsResolver: ResolveFn<ProjectCount> = (): Observable<ProjectCount> => {
  const projectService = inject(ProjectService);
  const authService = inject(AuthService);

  authService.getProfile().pipe(take(1)).subscribe(noop);
  return projectService.getCount();
};
