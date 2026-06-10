/** @format */

import { HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { ApiPagination } from "../../other/api-pagination.model";
import { ProjectSubscriber } from "../project-subscriber.model";
import { Project } from "../project.model";

/** Порт подписок на проект: подписчики, проекты-подписки, добавить/удалить. */
export abstract class ProjectSubscriptionRepositoryPort {
  abstract getSubscribers(projectId: number): Observable<ProjectSubscriber[]>;
  abstract addSubscription(projectId: number): Observable<void>;
  abstract getSubscriptions(
    userId: number,
    params?: HttpParams,
  ): Observable<ApiPagination<Project>>;
  abstract deleteSubscription(projectId: number): Observable<void>;
}
