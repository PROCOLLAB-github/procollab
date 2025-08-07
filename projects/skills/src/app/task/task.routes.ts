/** @format */

import type { Routes } from "@angular/router";
import { TaskComponent } from "./task/task.component";
import { SubtaskComponent } from "./subtask/subtask.component";
import { TaskCompleteComponent } from "./complete/complete.component";
import { taskDetailResolver } from "./task.resolver";
import { taskCompleteResolver } from "./complete/complete.resolver";

/**
 * Конфигурация маршрутов для модуля задач
 * Определяет структуру навигации и связывает компоненты с URL-путями
 *
 * Структура маршрутов:
 * - /:taskId - основной компонент задачи
 *   - /results - компонент результатов выполнения задачи
 *   - /:subTaskId - компонент подзадачи
 */
export const TASK_ROUTES: Routes = [
  {
    path: ":taskId", // Маршрут с параметром ID задачи
    component: TaskComponent, // Основной компонент задачи
    resolve: {
      data: taskDetailResolver, // Предварительная загрузка данных задачи
    },
    children: [
      {
        path: "results", // Маршрут для отображения результатов
        component: TaskCompleteComponent,
        resolve: {
          data: taskCompleteResolver, // Предварительная загрузка результатов
        },
      },
      {
        path: ":subTaskId", // Маршрут для подзадач
        component: SubtaskComponent,
      },
    ],
  },
];
