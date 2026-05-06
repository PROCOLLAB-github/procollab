/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router, UrlTree } from "@angular/router";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { catchError, map, Observable, of } from "rxjs";

export const ProfileEditRequiredGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot
): Observable<boolean | UrlTree> => {
  const router = inject(Router);
  const authRepository = inject(AuthRepositoryPort);

  const profileId = Number(route.paramMap.get("id"));

  return authRepository.fetchProfile().pipe(
    map(profile =>
      profile.id === profileId ? true : router.createUrlTree([`/office/profile/${profileId}/`])
    ),
    catchError(() => of(router.createUrlTree(["/auth/login"])))
  );
};
