/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { ApiService } from "@corelib";
import { StepType, TaskStep, TaskStepsResponse } from "../../../models/skill.model";
import { Observable, tap } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class TaskService {
  private apiService = inject(ApiService);

  currentSteps = signal<TaskStepsResponse["stepData"]>([]);

  getStep(stepId: number): TaskStep | undefined {
    return this.currentSteps().find(s => s.id === stepId);
  }

  getNextStep(stepId: number): TaskStep | undefined {
    const step = this.getStep(stepId);
    if (!step) return;

    return this.currentSteps().find(s => s.ordinalNumber === step.ordinalNumber + 1);
  }

  fetchSteps(taskId: number) {
    return this.apiService.get<TaskStepsResponse>(`/courses/${taskId}`).pipe(
      tap(res => {
        this.currentSteps.set(res.stepData);
      })
    );
  }

  private readonly stepRouteMapping: Record<TaskStep["type"], string> = {
    question_connect: "connect",
    exclude_question: "exclude-correct",
    info_slide: "info-slide",
    question_single_answer: "single-correct",
  };

  fetchStep(taskStepId: TaskStep["id"], taskStepType: TaskStep["type"]): Observable<StepType> {
    const route = `/questions/${this.stepRouteMapping[taskStepType]}/${taskStepId}`;

    return this.apiService.get<StepType>(route);
  }

  checkStep(taskStepId: TaskStep["id"], taskStepType: TaskStep["type"], body: any) {
    const route = `/questions/${this.stepRouteMapping[taskStepType]}/check/${taskStepId}`;

    return this.apiService.post<void>(route, body);
  }
}
