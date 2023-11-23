/** @format */

import { Injectable } from "@angular/core";
import { Router, UrlTree } from "@angular/router";
import { AuthService } from "../services";
import { catchError, map, Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class AuthRequiredGuard  {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> | UrlTree {
    if (this.authService.getTokens() === null) {
      return this.router.createUrlTree(["/auth/login"]);
    }

    return this.authService.getProfile().pipe(
      map(profile => !!profile),
      catchError(() => {
        return this.router.navigateByUrl("/auth/login");
      })
    );
  }
}
