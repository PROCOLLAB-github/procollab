/** @format */

import { HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { ProjectSubscriptionRepositoryPort } from "@domain/project/ports/project-subscription.repository.port";
import { ProjectSubscriber } from "@domain/project/project-subscriber.model";
import { Project } from "@domain/project/project.model";
import { SubscriptionHttpAdapter } from "../../adapters/subscription/subscription-http.adapter";
import { EventBus } from "@domain/shared/event-bus";
import { EntityCache } from "@domain/shared/entity-cache";
import { ProjectSubscribed } from "@domain/project/events/project-subscribed.event";
import { ProjectUnSubscribed } from "@domain/project/events/project-unsubsribed.event";
import { RemoveProjectCollaborator } from "@domain/project/events/remove-project-collaborator.event";
import { AcceptInvite } from "@domain/invite/events/accept-invite.event";
import { LoggedOut } from "@domain/auth/events/logged-out.event";

/** Репозиторий подписок на проект: подписчики и проекты-подписки пользователя. */
@Injectable({ providedIn: "root" })
export class ProjectSubscriptionRepository implements ProjectSubscriptionRepositoryPort {
  private readonly subscriptionAdapter = inject(SubscriptionHttpAdapter);
  private readonly eventBus = inject(EventBus);
  private readonly subscribersCache = new EntityCache<ProjectSubscriber[]>();

  constructor() {
    this.initializeEventListeners();
  }

  private initializeEventListeners() {
    this.eventBus.on<ProjectSubscribed>("ProjectSubscribed").subscribe({
      next: event => {
        this.subscribersCache.invalidate(event.payload.projectId);
      },
    });

    this.eventBus.on<ProjectUnSubscribed>("ProjectUnSubscribed").subscribe({
      next: event => {
        this.subscribersCache.invalidate(event.payload.projectId);
      },
    });

    this.eventBus.on<RemoveProjectCollaborator>("RemoveProjectCollaborator").subscribe({
      next: event => {
        this.subscribersCache.invalidate(event.payload.projectId);
      },
    });

    this.eventBus.on<AcceptInvite>("AcceptInvite").subscribe({
      next: event => {
        this.subscribersCache.invalidate(event.payload.projectId);
      },
    });

    this.eventBus.on<LoggedOut>("LoggedOut").subscribe({
      next: () => {
        this.subscribersCache.clear();
      },
    });
  }

  getSubscribers(projectId: number): Observable<ProjectSubscriber[]> {
    return this.subscribersCache.getOrFetch(projectId, () =>
      this.subscriptionAdapter.getSubscribers(projectId),
    );
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
