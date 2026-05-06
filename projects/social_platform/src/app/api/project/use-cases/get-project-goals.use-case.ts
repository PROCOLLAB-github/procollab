/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { Goal } from "@domain/project/goals.model";
import { ProjectGoalsRepositoryPort } from "@domain/project/ports/project-goals.repository.port";
import { fail, ok, Result } from "@domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class GetProjectGoalsUseCase {
  private readonly projectGoalsRepositoryPort = inject(ProjectGoalsRepositoryPort);

  execute(
    projectId: number
  ): Observable<Result<Goal[], { kind: "get_project_goals_error"; cause?: unknown }>> {
    return this.projectGoalsRepositoryPort.fetchAll(projectId).pipe(
      map(goals => ok<Goal[]>(goals)),
      catchError(error => of(fail({ kind: "get_project_goals_error" as const, cause: error })))
    );
  }
}
