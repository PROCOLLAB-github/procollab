/** @format */

import type { ResolveFn } from "@angular/router";
import { inject } from "@angular/core";
import { AuthService } from "@auth/services";
import { of, switchMap } from "rxjs";
import { Project } from "@office/models/project.model";

export const ProjectsSubscriptionsResolver: ResolveFn<{ results: Project[] }> = (route, state) => {
  const authService = inject(AuthService);

  return authService.profile.pipe(switchMap(p => of({ results: p.subscribedProjects })));
};
