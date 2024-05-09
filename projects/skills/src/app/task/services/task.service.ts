/** @format */

import { inject, Injectable } from "@angular/core";
import { ApiService } from "@corelib";
import { StepType, TaskStep, TaskStepsResponse } from "../../../models/skill.model";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class TaskService {
  private apiService = inject(ApiService);

  getSteps(taskId: number) {
    return this.apiService.get<TaskStepsResponse>(`/courses/${taskId}`);
  }

  private readonly stepRouteMapping: Record<TaskStep["type"], string> = {
    question_connect: "connect",
    exclude_question: "exclude-correct",
    info_slide: "info-slide",
    question_single_answer: "single-correct",
  };

  getStep(taskStepId: TaskStep["id"], taskStepType: TaskStep["type"]): Observable<StepType> {
    const route = `/questions/${this.stepRouteMapping[taskStepType]}/${taskStepId}`;

    return this.apiService.get<StepType>(route);
  }
}
