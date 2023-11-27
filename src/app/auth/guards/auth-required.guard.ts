/** @format */

import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services";
import { catchError, map } from "rxjs";

export const AuthRequiredGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.getTokens() === null) {
    return router.createUrlTree(["/auth/login"]);
  }

  return authService.getProfile().pipe(
    map(profile => !!profile),
    catchError(() => {
      return router.navigateByUrl("/auth/login");
    })
  );
};
