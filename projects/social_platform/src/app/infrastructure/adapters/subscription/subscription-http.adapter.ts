/** @format */

import { inject, Injectable } from "@angular/core";
import { ApiService } from "@corelib";
import { Observable } from "rxjs";
import { HttpParams } from "@angular/common/http";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { ProjectSubscriber } from "@domain/project/project-subscriber.model";
import { Project } from "@domain/project/project.model";

@Injectable({ providedIn: "root" })
export class SubscriptionHttpAdapter {
  private readonly PROJECTS_URL = "/projects";
  private readonly AUTH_USERS_URL = "/auth/users";
  private readonly apiService = inject(ApiService);

  getSubscribers(projectId: number): Observable<ProjectSubscriber[]> {
    return this.apiService.get<ProjectSubscriber[]>(
      `${this.PROJECTS_URL}/${projectId}/subscribers/`
    );
  }

  addSubscription(projectId: number): Observable<void> {
    return this.apiService.post<void>(`${this.PROJECTS_URL}/${projectId}/subscribe/`, {});
  }

  getSubscriptions(userId: number, params?: HttpParams): Observable<ApiPagination<Project>> {
    return this.apiService.get(`${this.AUTH_USERS_URL}/${userId}/subscribed_projects/`, params);
  }

  deleteSubscription(projectId: number): Observable<void> {
    return this.apiService.post<void>(`${this.PROJECTS_URL}/${projectId}/unsubscribe/`, {});
  }
}
