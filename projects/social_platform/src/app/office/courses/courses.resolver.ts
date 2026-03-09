/** @format */

import { inject } from "@angular/core";
import { CoursesService } from "./courses.service";

/**
 * Резолвер для загрузки списка всех доступных траекторий
 * Выполняется перед активацией маршрута для предзагрузки данных
 * @returns Observable с массивом траекторий (20 элементов с offset 0)
 */

/**
 * Функция-резолвер для получения списка траекторий
 * @returns Promise/Observable с данными траекторий
 */
export const CoursesResolver = () => {
  const coursesService = inject(CoursesService);

  return coursesService.getCourses();
};
