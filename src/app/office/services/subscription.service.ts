/** @format */

import { Injectable } from "@angular/core";
import { ApiService } from "@core/services";
import { Observable } from "rxjs";
import { ProjectSubscriber } from "@office/models/project-subscriber.model";
import { ApiPagination } from "@office/models/api-pagination.model";
import { Project } from "@office/models/project.model";
import { HttpParams } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class SubscriptionService {
  constructor(private readonly apiService: ApiService) {}

  getSubscribers(projectId: number): Observable<ProjectSubscriber[]> {
    return this.apiService.get<ProjectSubscriber[]>(`/projects/${projectId}/subscribers/`);
  }

  addSubscription(projectId: number): Observable<void> {
    return this.apiService.post<void>(`/projects/${projectId}/subscribe/`, {});
  }

  getSubscriptions(userId: number, params?: HttpParams): Observable<ApiPagination<Project>> {
    return this.apiService.get(`/auth/users/${userId}/subscribed_projects`, params);
  }

  deleteSubscription(projectId: number): Observable<void> {
    return this.apiService.post<void>(`/projects/${projectId}/unsubscribe/`, {});
  }
}
