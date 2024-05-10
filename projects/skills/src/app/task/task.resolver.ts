/** @format */

import { ResolveFn } from "@angular/router";
import { inject } from "@angular/core";
import { TaskService } from "./services/task.service";
import { TaskStepsResponse } from "../../models/skill.model";

export const taskDetailResolver: ResolveFn<TaskStepsResponse> = (route, _state) => {
  const taskService = inject(TaskService);

  return taskService.fetchSteps(route.params["taskId"]);
};
