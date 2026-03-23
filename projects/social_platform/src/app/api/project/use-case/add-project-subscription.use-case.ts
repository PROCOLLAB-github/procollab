/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of, tap } from "rxjs";
import { ProjectSubscriptionRepositoryPort } from "../../../domain/project/ports/project-subscription.repository.port";
import { fail, ok, Result } from "../../../domain/shared/result.type";
import { EventBus } from "../../../domain/shared/event-bus";
import { projectSubscribed } from "../../../domain/project/events/project-subscribed.event";

@Injectable({ providedIn: "root" })
export class AddProjectSubscriptionUseCase {
  private readonly projectSubscriptionRepositoryPort = inject(ProjectSubscriptionRepositoryPort);
  private readonly eventBus = inject(EventBus);

  execute(
    projectId: number
  ): Observable<Result<void, { kind: "add_project_subscription_error"; cause?: unknown }>> {
    return this.projectSubscriptionRepositoryPort.addSubscription(projectId).pipe(
      tap(() => this.eventBus.emit(projectSubscribed(projectId))),
      map(() => ok<void>(undefined)),
      catchError(error =>
        of(fail({ kind: "add_project_subscription_error" as const, cause: error }))
      )
    );
  }
}
