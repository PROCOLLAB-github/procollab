/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { ProjectGoalsRepositoryPort } from "../../../domain/project/ports/project-goals.repository.port";
import { fail, ok, Result } from "../../../domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class DeleteGoalUseCase {
  private readonly projectGoalsRepositoryPort = inject(ProjectGoalsRepositoryPort);

  execute(
    projectId: number,
    goalId: number
  ): Observable<Result<void, { kind: "delete_project_goal_error"; cause?: unknown }>> {
    return this.projectGoalsRepositoryPort.deleteGoal(projectId, goalId).pipe(
      map(() => ok<void>(undefined)),
      catchError(error => of(fail({ kind: "delete_project_goal_error" as const, cause: error })))
    );
  }
}
