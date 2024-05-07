/** @format */

import { inject, Injectable } from "@angular/core";
import { ApiService } from "@corelib";
import { TaskStep, TaskStepsResponse } from "../../../models/skill.model";

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

  getStep(taskStep: TaskStep) {
    const route = `/questions/${this.stepRouteMapping[taskStep.type]}/${taskStep.id}`;

    return this.apiService.get(route);
  }
}
