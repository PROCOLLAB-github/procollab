/** @format */

import { inject, Injectable } from "@angular/core";
import { ApiService } from "@corelib";
import { TaskStepsResponse } from "../../../models/skill.model";

@Injectable({
  providedIn: "root",
})
export class TaskService {
  private apiService = inject(ApiService);

  getSteps(taskId: number) {
    return this.apiService.get<TaskStepsResponse>(`/courses/${taskId}`);
  }
}
