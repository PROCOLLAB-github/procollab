/** @format */

import { Injectable } from "@angular/core";
import { CanActivate, Router, UrlTree } from "@angular/router";
import { AuthService } from "../services";

@Injectable({
  providedIn: "root",
})
export class AuthRequiredGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    if (this.authService.getTokens() === null) {
      return this.router.createUrlTree(["/auth/login"]);
    }

    return true;
  }
}
