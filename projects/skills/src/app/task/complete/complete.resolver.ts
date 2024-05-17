/** @format */

import { ResolveFn } from "@angular/router";
import { TaskService } from "../services/task.service";
import { inject } from "@angular/core";
import { TaskResults } from "../../../models/skill.model";

export const taskCompleteResolver: ResolveFn<TaskResults> = (route, _state) => {
  const taskService = inject(TaskService);
  return taskService.fetchResults(route.parent?.params["taskId"]);
};
