/** @format */

import type { ResolveFn } from "@angular/router";
import { inject } from "@angular/core";
import { AuthService } from "@auth/services";
import { switchMap } from "rxjs";
import { Project } from "@office/models/project.model";
import { SubscriptionService } from "@office/services/subscription.service";

export const ProjectsSubscriptionsResolver: ResolveFn<{ results: Project[] }> = () => {
  const authService = inject(AuthService);
  const subscriptionService = inject(SubscriptionService);

  return authService.profile.pipe(switchMap(p => subscriptionService.getSubscriptions(p.id)));
};
