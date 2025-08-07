/** @format */

import { inject } from "@angular/core";
import { TrajectoriesService } from "../trajectories.service";

/**
 * Резолвер для загрузки персональной траектории пользователя
 * Выполняется перед активацией маршрута "my"
 * @returns Observable с данными пользовательской траектории
 */

/**
 * Функция-резолвер для получения персональной траектории пользователя
 * @returns Promise/Observable с данными пользовательской траектории
 */
export const TrajectoriesMyResolver = () => {
  const trajectoriesService = inject(TrajectoriesService);

  return trajectoriesService.getMyTrajectory();
};
