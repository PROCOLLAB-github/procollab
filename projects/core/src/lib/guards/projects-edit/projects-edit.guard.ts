/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router, UrlTree } from "@angular/router";
import { ProjectRepositoryPort } from "@domain/project/ports/project.repository.port";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";

export const ProjectEditRequiredGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot
): Observable<boolean | UrlTree> => {
  const router = inject(Router);
  const projectRepository = inject(ProjectRepositoryPort);

  const projectId = Number(route.paramMap.get("projectId"));
  if (isNaN(projectId)) {
    return of(router.createUrlTree(["/office/projects/my"]));
  }

  return projectRepository.getOne(projectId).pipe(
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
