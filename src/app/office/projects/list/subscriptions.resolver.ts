/** @format */

import type { ResolveFn } from "@angular/router";
import { inject, Injectable } from "@angular/core";
import { AuthService } from "@auth/services";
import { of, switchMap, Observable } from "rxjs";
import { Project } from "@office/models/project.model";

// export const ProjectsSubscriptionsResolver: ResolveFn<{ results: Project[] }> = (route, state) => {
//   const authService = inject(AuthService);

//   return authService.profile.pipe(switchMap(p => of({ results: p.subscribedProjects })));
// };

@Injectable({
  providedIn: "root",
})
export class ProjectsSubscriptionsResolver {
  constructor(private readonly authService: AuthService) {}

  resolve(): Observable<{ results: Project[] }> {
    return this.authService
      .getProfile()
      .pipe(switchMap(p => of({ results: p.subscribedProjects })));
  }
}
