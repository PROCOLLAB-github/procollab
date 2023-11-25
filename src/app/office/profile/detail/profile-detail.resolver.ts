/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { AuthService } from "@auth/services";
import { User } from "@auth/models/user.model";

export const ProfileDetailResolver: ResolveFn<User> = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);

  return authService.getUser(Number(route.paramMap.get("id")));
};
