/** @format */

import { inject } from "@angular/core";
import { TrajectoriesService } from "../../trajectories/trajectories.service";

/**
 * Резолвер для загрузки списка студентов ментора
 *
 * Выполняется перед активацией маршрута студентов и предоставляет
 * список всех студентов, закрепленных за текущим ментором.
 *
 * Доступен только пользователям со статусом ментора.
 *
 * @returns Observable<Student[]> - массив студентов с информацией о встречах
 */
export const studentsResolver = () => {
  const trajectoryService = inject(TrajectoriesService);
  return trajectoryService.getMentorStudents();
};
