/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { ProjectSubscriptionRepositoryPort } from "../../../domain/project/ports/project-subscription.repository.port";
import { fail, ok, Result } from "../../../domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class DeleteProjectSubscriptionUseCase {
  private readonly projectSubscriptionRepositoryPort = inject(ProjectSubscriptionRepositoryPort);

  execute(
    projectId: number
  ): Observable<Result<void, { kind: "delete_project_subscription_error"; cause?: unknown }>> {
    return this.projectSubscriptionRepositoryPort.deleteSubscription(projectId).pipe(
      map(() => ok<void>(undefined)),
      catchError(error =>
        of(fail({ kind: "delete_project_subscription_error" as const, cause: error }))
      )
    );
  }
}
