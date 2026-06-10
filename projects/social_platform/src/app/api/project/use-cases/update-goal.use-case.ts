/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { Goal } from "@domain/project/goals.model";
import { ProjectGoalsRepositoryPort } from "@domain/project/ports/project-goals.repository.port";
import { fail, ok, Result } from "@domain/shared/result.type";
import { GoalFormData } from "@domain/project/goal-form-data.model";

/** Сценарий: изменить цель проекта; ошибка → `update_project_goal_error`. */
@Injectable({ providedIn: "root" })
export class UpdateGoalUseCase {
  private readonly projectGoalsRepositoryPort = inject(ProjectGoalsRepositoryPort);

  execute(
    projectId: number,
    goalId: number,
    goal: GoalFormData,
  ): Observable<Result<Goal, { kind: "update_project_goal_error"; cause?: unknown }>> {
    return this.projectGoalsRepositoryPort.editGoal(projectId, goalId, goal).pipe(
      map(result => ok<Goal>(result)),
      catchError(error => of(fail({ kind: "update_project_goal_error" as const, cause: error }))),
    );
  }
}
