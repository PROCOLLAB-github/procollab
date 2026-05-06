/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { ProjectSubscriptionRepositoryPort } from "@domain/project/ports/project-subscription.repository.port";
import { ProjectSubscriber } from "@domain/project/project-subscriber.model";
import { fail, ok, Result } from "@domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class GetProjectSubscribersUseCase {
  private readonly projectSubscriptionRepositoryPort = inject(ProjectSubscriptionRepositoryPort);

  execute(
    projectId: number
  ): Observable<
    Result<ProjectSubscriber[], { kind: "get_project_subscribers_error"; cause?: unknown }>
  > {
    return this.projectSubscriptionRepositoryPort.getSubscribers(projectId).pipe(
      map(subscribers => ok<ProjectSubscriber[]>(subscribers)),
      catchError(error =>
        of(fail({ kind: "get_project_subscribers_error" as const, cause: error }))
      )
    );
  }
}
