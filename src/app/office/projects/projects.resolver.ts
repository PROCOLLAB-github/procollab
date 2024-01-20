/** @format */

import { inject } from "@angular/core";
import { forkJoin, switchMap, map } from "rxjs";
import { ProjectCount } from "@models/project.model";
import { ProjectService } from "@services/project.service";
import { AuthService } from "@auth/services";
import { ResolveFn } from "@angular/router";
import { SubscriptionService } from "@office/services/subscription.service";

export const ProjectsResolver: ResolveFn<ProjectCount> = () => {
  const projectService = inject(ProjectService);
  const authService = inject(AuthService);
  const subscriptionService = inject(SubscriptionService);

  return authService.profile.pipe(
    switchMap(p => {
      return forkJoin([
        projectService.getCount(),
        subscriptionService.getSubscriptions(p.id).pipe(map(resp => resp.count)),
      ]).pipe(map(([countData, subsCount]) => ({ ...countData, subs: subsCount })));
    })
  );
};
