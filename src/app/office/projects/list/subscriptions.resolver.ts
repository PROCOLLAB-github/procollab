/** @format */

import type { ResolveFn } from "@angular/router";
import { inject } from "@angular/core";
import { AuthService } from "@auth/services";
import { Observable, of, switchMap } from "rxjs";
import { Project } from "@office/models/project.model";

export const ProjectsSubscriptionsResolver: ResolveFn<{ results: Project[] }> = (): Observable<{
  results: Project[];
}> => {
  const authService = inject(AuthService);

  return authService.getProfile().pipe(switchMap(p => of({ results: p.subscribedProjects })));
};
