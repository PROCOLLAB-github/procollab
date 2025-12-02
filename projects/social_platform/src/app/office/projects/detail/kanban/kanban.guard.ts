/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router, UrlTree } from "@angular/router";
import { User } from "@auth/models/user.model";
import { AuthService } from "@auth/services";
import { Collaborator } from "@office/models/collaborator.model";
import { ProjectService } from "@office/services/project.service";
import { catchError, map, Observable, of, switchMap } from "rxjs";

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
