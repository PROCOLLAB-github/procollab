/** @format */

import type { ResolveFn } from "@angular/router";
import { inject } from "@angular/core";
import { CourseLesson } from "@domain/project/courses.model";
import { CoursesHttpAdapter } from "@infrastructure/adapters/courses/courses-http.adapter";

/**
 * Резолвер для получения данных задачи
 * Используется для предварительной загрузки данных о шагах задачи перед отображением компонента
 *
 * @param route - объект маршрута, содержащий параметры URL (включая taskId)
 * @param _state - состояние маршрутизатора (не используется)
 * @returns Promise<CourseLesson> - промис с данными о шагах задачи
 */
export const lessonDetailResolver: ResolveFn<CourseLesson> = (route, _state) => {
  const coursesAdapter = inject(CoursesHttpAdapter);
  const lessonId = route.params["lessonId"];

  // Получаем ID задачи из параметров маршрута и загружаем шаги задачи
  return coursesAdapter.getCourseLesson(lessonId);
};
