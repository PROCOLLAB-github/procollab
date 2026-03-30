/** @format */

import { Observable } from "rxjs";
import { Goal } from "../goals.model";
import { GoalFormData } from "@infrastructure/adapters/project/dto/project-goal.dto";

/**
 * Порт репозитория целей проекта.
 * Реализуется в infrastructure/repository/project/project-goals.repository.ts
 */
export abstract class ProjectGoalsRepositoryPort {
  abstract fetchAll(projectId: number): Observable<Goal[]>;
  abstract createGoal(projectId: number, params: GoalFormData[]): Observable<Goal[]>;
  abstract editGoal(projectId: number, goalId: number, params: GoalFormData): Observable<Goal>;
  abstract deleteGoal(projectId: number, goalId: number): Observable<void>;
}
