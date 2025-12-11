/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router, UrlTree } from "@angular/router";
import { User } from "projects/social_platform/src/app/domain/auth/user.model";
import { Collaborator } from "projects/social_platform/src/app/domain/project/collaborator.model";
import { ProjectService } from "projects/social_platform/src/app/api/project/project.service";
import { catchError, map, Observable, of, switchMap } from "rxjs";
import { AuthService } from "projects/social_platform/src/app/api/auth";

export const KanbanBoardGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot
): Observable<UrlTree | boolean> => {
  const router = inject(Router);
  const projectService = inject(ProjectService);
  const authService = inject(AuthService);

  const projectId = Number(route.parent?.params["projectId"]);

  if (!projectId) return of(router.createUrlTree([`/office/projects/${projectId}/`]));

  return authService.profile.pipe(
    switchMap((user: User) =>
      projectService.getOne(projectId).pipe(
        map(project => {
          const isInProject = project.collaborators.some(
            (collaborator: Collaborator) => collaborator.userId === user.id
          );

          return isInProject ? true : router.createUrlTree([`/office/projects/${projectId}`]);
        }),
        catchError(() => of(router.createUrlTree(["/office/projects"])))
      )
    )
  );
};
