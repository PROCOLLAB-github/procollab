/** @format */

import { HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { ProjectSubscriptionRepositoryPort } from "@domain/project/ports/project-subscription.repository.port";
import { Project } from "@domain/project/project.model";
import { fail, ok, Result } from "@domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class GetProjectSubscriptionsUseCase {
  private readonly projectSubscriptionRepositoryPort = inject(ProjectSubscriptionRepositoryPort);

  execute(
    userId: number,
    params?: HttpParams
  ): Observable<
    Result<ApiPagination<Project>, { kind: "get_project_subscriptions_error"; cause?: unknown }>
  > {
    return this.projectSubscriptionRepositoryPort.getSubscriptions(userId, params).pipe(
      map(subscriptions => ok<ApiPagination<Project>>(subscriptions)),
      catchError(error =>
        of(fail({ kind: "get_project_subscriptions_error" as const, cause: error }))
      )
    );
  }
}
