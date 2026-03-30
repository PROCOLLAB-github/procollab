/** @format */

import { HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { ProjectSubscriptionRepositoryPort } from "@domain/project/ports/project-subscription.repository.port";
import { ProjectSubscriber } from "@domain/project/project-subscriber.model";
import { Project } from "@domain/project/project.model";
import { SubscriptionHttpAdapter } from "../../adapters/subscription/subscription-http.adapter";

@Injectable({ providedIn: "root" })
export class ProjectSubscriptionRepository implements ProjectSubscriptionRepositoryPort {
  private readonly subscriptionAdapter = inject(SubscriptionHttpAdapter);

  getSubscribers(projectId: number): Observable<ProjectSubscriber[]> {
    return this.subscriptionAdapter.getSubscribers(projectId);
  }

  addSubscription(projectId: number): Observable<void> {
    return this.subscriptionAdapter.addSubscription(projectId);
  }

  getSubscriptions(userId: number, params?: HttpParams): Observable<ApiPagination<Project>> {
    return this.subscriptionAdapter.getSubscriptions(userId, params);
  }

  deleteSubscription(projectId: number): Observable<void> {
    return this.subscriptionAdapter.deleteSubscription(projectId);
  }
}
