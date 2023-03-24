/** @format */

import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve } from "@angular/router";
import { Observable } from "rxjs";
import { AuthService } from "@auth/services";
import { User } from "@auth/models/user.model";

@Injectable({
  providedIn: "root",
})
export class ProfileDetailResolver implements Resolve<User> {
  constructor(private readonly authService: AuthService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<User> {
    return this.authService.getUser(parseInt(<string>route.paramMap.get("id")));
  }
}
