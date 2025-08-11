/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router, UrlTree } from "@angular/router";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { ProjectService } from "@office/services/project.service";

export const ProjectEditRequiredGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot
): Observable<boolean | UrlTree> => {
  const router = inject(Router);
  const projectService = inject(ProjectService);

  const projectId = Number(route.paramMap.get("projectId"));
  if (isNaN(projectId)) {
    return of(router.createUrlTree(["/office/projects/my"]));
  }

  return projectService.getOne(projectId).pipe(
    map(project => {
      if (project.partnerProgram?.isSubmitted) {
        return router.createUrlTree([`/office/projects/${projectId}`]);
      }
      return true;
    }),
    catchError(() => {
      return of(router.createUrlTree([`/office/projects/${projectId}`]));
    })
  );
};
