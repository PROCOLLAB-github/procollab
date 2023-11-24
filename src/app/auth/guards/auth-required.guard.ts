/** @format */

import { inject } from "@angular/core";
import { Router, UrlTree } from "@angular/router";
import { AuthService } from "../services";
import { catchError, map, Observable } from "rxjs";

export const AuthRequiredGuard = (): Observable<boolean> | UrlTree => {
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
