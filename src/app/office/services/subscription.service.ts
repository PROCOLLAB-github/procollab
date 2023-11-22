/** @format */

import { Injectable } from "@angular/core";
import { ApiService } from "@core/services";
import { Observable } from "rxjs";
import { ProjectSubscriber } from "@office/models/project-subscriber.model";

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

  deleteSubscription(projectId: number): Observable<void> {
    return this.apiService.post<void>(`/projects/${projectId}/unsubscribe/`, {});
  }
}
