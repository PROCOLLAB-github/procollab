/** @format */

import type { ResolveFn } from "@angular/router";
import { TaskService } from "../services/task.service";
import { inject } from "@angular/core";
import type { TaskResults } from "../../../models/skill.model";

/**
 * Резолвер для получения результатов выполнения задачи
 * Загружает данные о результатах перед отображением компонента завершения
 *
 * @param route - объект маршрута с параметрами
 * @param _state - состояние маршрутизатора (не используется)
 * @returns Promise<TaskResults> - промис с результатами выполнения задачи
 */
export const taskCompleteResolver: ResolveFn<TaskResults> = (route, _state) => {
  const taskService = inject(TaskService);

  // Получаем ID задачи из родительского маршрута и загружаем результаты
  return taskService.fetchResults(route.parent?.params["taskId"]);
};
