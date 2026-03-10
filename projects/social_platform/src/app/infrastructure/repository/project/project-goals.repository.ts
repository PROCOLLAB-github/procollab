/** @format */

import { inject, Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { ProjectGoalsHttpAdapter } from "../../adapters/project/project-goals-http.adapter";
import { plainToInstance } from "class-transformer";
import { Goal } from "../../../domain/project/goals.model";
import { GoalFormData } from "../../adapters/project/dto/project-goal.dto";

@Injectable({ providedIn: "root" })
export class ProjectGoalsRepository {
  private readonly projectGoalsHttpAdapter = inject(ProjectGoalsHttpAdapter);

  fetchAll(id: number): Observable<Goal[]> {
    return this.projectGoalsHttpAdapter
      .getGoals(id)
      .pipe(map(goals => plainToInstance(Goal, goals)));
  }

  createGoal(id: number, params: GoalFormData[]): Observable<Goal[]> {
    return this.projectGoalsHttpAdapter
      .addGoals(id, params)
      .pipe(map(goals => plainToInstance(Goal, goals)));
  }

  editGoal(projectId: number, goalId: number, params: GoalFormData): Observable<Goal> {
    return this.projectGoalsHttpAdapter
      .editGoal(projectId, goalId, params)
      .pipe(map(goal => plainToInstance(Goal, goal)));
  }

  deleteGoal(projectId: number, goalId: number): Observable<void> {
    return this.projectGoalsHttpAdapter.deleteGoals(projectId, goalId);
  }
}
