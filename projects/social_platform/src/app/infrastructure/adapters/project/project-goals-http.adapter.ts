/** @format */

import { inject, Injectable } from "@angular/core";
import { ApiService } from "@corelib";
import { Observable } from "rxjs";
import { Goal } from "../../../domain/project/goals.model";
import { GoalFormData } from "./dto/project-goal.dto";

@Injectable({ providedIn: "root" })
export class ProjectGoalsHttpAdapter {
  private readonly PROJECTS_URL = "/projects";
  private readonly apiService = inject(ApiService);

  /**
   * Получает список целей проекта
   *
   * @returns Observable<Goal> - объект с массивом целей проекта
   */
  getGoals(projectId: number): Observable<Goal[]> {
    return this.apiService.get<Goal[]>(`${this.PROJECTS_URL}/${projectId}/goals/`);
  }

  /**
   * Отправляем цель
   */
  addGoals(projectId: number, params: GoalFormData[]) {
    return this.apiService.post<Goal[]>(`${this.PROJECTS_URL}/${projectId}/goals/`, params);
  }

  /**
   * Редактирование цели
   */
  editGoal(projectId: number, goalId: number, params: GoalFormData) {
    return this.apiService.put(`${this.PROJECTS_URL}/${projectId}/goals/${goalId}`, params);
  }

  /**
   * Удаляем цель
   */
  deleteGoals(projectId: number, goalId: number): Observable<void> {
    return this.apiService.delete<void>(`${this.PROJECTS_URL}/${projectId}/goals/${goalId}`);
  }
}
