/** @format */

import type { Routes } from "@angular/router";
import { LessonComponent } from "../../pages/courses/lesson/lesson.component";
import { TaskCompleteComponent } from "../../pages/courses/lesson/complete/complete.component";
import { lessonDetailResolver } from "../../pages/courses/lesson/lesson.resolver";

/** Конфигурация маршрутов для модуля уроков. */
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
