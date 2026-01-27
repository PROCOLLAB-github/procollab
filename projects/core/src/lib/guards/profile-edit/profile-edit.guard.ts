/** @format */

import { inject, signal } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router, UrlTree } from "@angular/router";
import { AuthService } from "projects/social_platform/src/app/api/auth";
import { Observable, of } from "rxjs";

export const ProfileEditRequiredGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot
): Observable<boolean | UrlTree> => {
  const router = inject(Router);
  const authService = inject(AuthService);

  const loggedUserId = signal<number | undefined>(undefined);

  authService.profile.subscribe({
    next: profile => {
      loggedUserId.set(profile.id);
    },
  });

  const profileId = Number(route.paramMap.get("id"));
  if (profileId !== loggedUserId()) {
    return of(router.createUrlTree([`/office/profile/${profileId}/`]));
  }

  return of(router.createUrlTree([`/office/profel/${profileId}/`]));
};
