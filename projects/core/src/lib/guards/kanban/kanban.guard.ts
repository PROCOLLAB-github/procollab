/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router, UrlTree } from "@angular/router";
import { User } from "projects/social_platform/src/app/domain/auth/user.model";
import { Collaborator } from "projects/social_platform/src/app/domain/project/collaborator.model";
import { catchError, map, Observable, of, switchMap } from "rxjs";
import { ProjectRepository } from "projects/social_platform/src/app/infrastructure/repository/project/project.repository";
import { AuthRepository } from "projects/social_platform/src/app/infrastructure/repository/auth/auth.repository";

export const KanbanBoardGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot
): Observable<UrlTree | boolean> => {
  const router = inject(Router);
  const projectRepository = inject(ProjectRepository);
  const authRepository = inject(AuthRepository);

  const projectId = Number(route.parent?.params["projectId"]);

  if (!projectId) return of(router.createUrlTree([`/office/projects/${projectId}/`]));

  return authRepository.profile.pipe(
    switchMap((user: User) =>
      projectRepository.getOne(projectId).pipe(
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
