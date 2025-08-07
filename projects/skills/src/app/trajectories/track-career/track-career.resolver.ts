/** @format */

import { inject } from "@angular/core";
import { TrajectoriesService } from "../trajectories.service";

/**
 * Резолвер для загрузки списка всех доступных траекторий
 * Выполняется перед активацией маршрута для предзагрузки данных
 * @returns Observable с массивом траекторий (20 элементов с offset 0)
 */

/**
 * Функция-резолвер для получения списка траекторий
 * @returns Promise/Observable с данными траекторий
 */
export const TrajectoriesResolver = () => {
  const trajectoriesService = inject(TrajectoriesService);

  return trajectoriesService.getTrajectories(20, 0);
};
