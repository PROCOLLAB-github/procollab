/** @format */

import { inject, Injectable } from "@angular/core";
import { ApiService } from "@corelib";
import { Observable } from "rxjs";
import { Goal } from "@domain/project/goals.model";
import { GoalFormData } from "@domain/project/goal-form-data.model";

/** HTTP-адаптер целей проекта: `/projects/<id>/goals`. */
@Injectable({ providedIn: "root" })
export class ProjectGoalsHttpAdapter {
  private readonly PROJECTS_URL = "/projects";
  private readonly apiService = inject(ApiService);

  getGoals(projectId: number): Observable<Goal[]> {
    return this.apiService.get<Goal[]>(`${this.PROJECTS_URL}/${projectId}/goals/`);
  }

  addGoals(projectId: number, params: GoalFormData[]) {
    return this.apiService.post<Goal[]>(`${this.PROJECTS_URL}/${projectId}/goals/`, params);
  }

  editGoal(projectId: number, goalId: number, params: GoalFormData) {
    return this.apiService.put(`${this.PROJECTS_URL}/${projectId}/goals/${goalId}/`, params);
  }

  deleteGoals(projectId: number, goalId: number): Observable<void> {
    return this.apiService.delete<void>(`${this.PROJECTS_URL}/${projectId}/goals/${goalId}/`);
  }
}
