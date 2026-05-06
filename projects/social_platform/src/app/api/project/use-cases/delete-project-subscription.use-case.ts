/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of, tap } from "rxjs";
import { ProjectSubscriptionRepositoryPort } from "@domain/project/ports/project-subscription.repository.port";
import { fail, ok, Result } from "@domain/shared/result.type";
import { projectUnSubscribed } from "@domain/project/events/project-unsubsribed.event";
import { EventBus } from "@domain/shared/event-bus";

@Injectable({ providedIn: "root" })
export class DeleteProjectSubscriptionUseCase {
  private readonly projectSubscriptionRepositoryPort = inject(ProjectSubscriptionRepositoryPort);
  private readonly eventBus = inject(EventBus);

  execute(
    projectId: number
  ): Observable<Result<void, { kind: "delete_project_subscription_error"; cause?: unknown }>> {
    return this.projectSubscriptionRepositoryPort.deleteSubscription(projectId).pipe(
      tap(() => this.eventBus.emit(projectUnSubscribed(projectId))),
      map(() => ok<void>(undefined)),
      catchError(error =>
        of(fail({ kind: "delete_project_subscription_error" as const, cause: error }))
      )
    );
  }
}
