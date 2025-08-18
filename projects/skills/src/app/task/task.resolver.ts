/** @format */

import type { ResolveFn } from "@angular/router";
import { inject } from "@angular/core";
import { TaskService } from "./services/task.service";
import type { TaskStepsResponse } from "../../models/skill.model";

/**
 * Резолвер для получения данных задачи
 * Используется для предварительной загрузки данных о шагах задачи перед отображением компонента
 *
 * @param route - объект маршрута, содержащий параметры URL (включая taskId)
 * @param _state - состояние маршрутизатора (не используется)
 * @returns Promise<TaskStepsResponse> - промис с данными о шагах задачи
 */
export const taskDetailResolver: ResolveFn<TaskStepsResponse> = (route, _state) => {
  const taskService = inject(TaskService);

  // Получаем ID задачи из параметров маршрута и загружаем шаги задачи
  return taskService.fetchSteps(route.params["taskId"]);
};
