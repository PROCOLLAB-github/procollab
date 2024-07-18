/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { AuthService } from "@auth/services";
import { User } from "@auth/models/user.model";
import { SubscriptionService } from "@office/services/subscription.service";
import { forkJoin, map } from "rxjs";
import { Project } from "@office/models/project.model";

export const ProfileDetailResolver: ResolveFn<[User, Project[]]> = (
  route: ActivatedRouteSnapshot,
) => {
  const authService = inject(AuthService);
  const subscriptionService = inject(SubscriptionService);

  return forkJoin([
    authService.getUser(Number(route.paramMap.get("id"))),
    subscriptionService
      .getSubscriptions(Number(route.paramMap.get("id")))
      .pipe(map(resp => resp.results)),
  ]);
};
