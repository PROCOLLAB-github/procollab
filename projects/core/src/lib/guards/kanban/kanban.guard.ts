/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router, UrlTree } from "@angular/router";
import { User } from "@domain/auth/user.model";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { Collaborator } from "@domain/project/collaborator.model";
import { ProjectRepositoryPort } from "@domain/project/ports/project.repository.port";
import { catchError, map, Observable, of, switchMap } from "rxjs";

export const KanbanBoardGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot
): Observable<UrlTree | boolean> => {
  const router = inject(Router);
  const projectRepository = inject(ProjectRepositoryPort);
  const authRepository = inject(AuthRepositoryPort);

  const projectId = Number(route.parent?.params["projectId"]);

  if (!projectId) return of(router.createUrlTree([`/office/projects/${projectId}/`]));

  return authRepository.fetchProfile().pipe(
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
    ),
    catchError(() => of(router.createUrlTree(["/auth/login"])))
  );
};
