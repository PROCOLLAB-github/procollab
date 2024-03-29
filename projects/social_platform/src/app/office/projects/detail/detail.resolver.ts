/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { forkJoin, of, switchMap } from "rxjs";
import { ProjectService } from "@services/project.service";
import { Project } from "@models/project.model";
import { SubscriptionService } from "@office/services/subscription.service";
import { ProjectSubscriber } from "@office/models/project-subscriber.model";

export const ProjectDetailResolver: ResolveFn<[Project, ProjectSubscriber[]]> = (
  route: ActivatedRouteSnapshot
) => {
  const projectService = inject(ProjectService);
  const subscriptionService = inject(SubscriptionService);

  return projectService.getOne(Number(route.paramMap.get("projectId"))).pipe(
    switchMap(project => {
      return forkJoin([of(project), subscriptionService.getSubscribers(project.id)]);
    })
  );
};
