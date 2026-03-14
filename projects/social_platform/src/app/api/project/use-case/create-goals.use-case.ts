/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { Goal } from "../../../domain/project/goals.model";
import { ProjectGoalsRepositoryPort } from "../../../domain/project/ports/project-goals.repository.port";
import { fail, ok, Result } from "../../../domain/shared/result.type";
import { GoalFormData } from "../../../infrastructure/adapters/project/dto/project-goal.dto";

@Injectable({ providedIn: "root" })
export class CreateGoalsUseCase {
  private readonly projectGoalsRepositoryPort = inject(ProjectGoalsRepositoryPort);

  execute(
    projectId: number,
    goals: GoalFormData[]
  ): Observable<Result<Goal[], { kind: "create_project_goals_error"; cause?: unknown }>> {
    return this.projectGoalsRepositoryPort.createGoal(projectId, goals).pipe(
      map(result => ok<Goal[]>(result)),
      catchError(error => of(fail({ kind: "create_project_goals_error" as const, cause: error })))
    );
  }
}
