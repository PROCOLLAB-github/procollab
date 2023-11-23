/** @format */

import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot } from "@angular/router";
import { Observable, forkJoin, of, switchMap } from "rxjs";
import { ProjectService } from "@services/project.service";
import { Project } from "@models/project.model";
import { SubscriptionService } from "@office/services/subscription.service";
import { ProjectSubscriber } from "@office/models/project-subscriber.model";

@Injectable({
  providedIn: "root",
})
export class ProjectDetailResolver  {
  constructor(
    private readonly projectService: ProjectService,
    private readonly subscriptionService: SubscriptionService
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<[Project, ProjectSubscriber[]]> {
    return this.projectService.getOne(Number(route.paramMap.get("projectId"))).pipe(
      switchMap(project => {
        return forkJoin([of(project), this.subscriptionService.getSubscribers(project.id)]);
      })
    );
  }
}
