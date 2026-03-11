/** @format */

import type { Routes } from "@angular/router";
import { LessonComponent } from "./lesson.component";
import { TaskCompleteComponent } from "./complete/complete.component";
import { lessonDetailResolver } from "./lesson.resolver";

/**
 * Конфигурация маршрутов для модуля уроков
 * Определяет структуру навигации и связывает компоненты с URL-путями
 *
 * Структура маршрутов:
 * - /:lessonId - основной компонент урока
 *   - /results - компонент результатов выполнения урока
 */
export const LESSON_ROUTES: Routes = [
  {
    path: ":lessonId",
    component: LessonComponent,
    resolve: {
      data: lessonDetailResolver,
    },
    children: [
      {
        path: "results",
        component: TaskCompleteComponent,
      },
    ],
  },
];
