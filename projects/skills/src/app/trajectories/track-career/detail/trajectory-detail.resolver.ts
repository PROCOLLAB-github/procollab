/** @format */

import { inject } from "@angular/core";
import type { ActivatedRouteSnapshot } from "@angular/router";
import { TrajectoriesService } from "../../trajectories.service";
import { forkJoin } from "rxjs";

/**
 * Резолвер для загрузки детальной информации о траектории
 * Загружает данные траектории, информацию о пользователе и индивидуальные навыки
 * @param route - снимок активного маршрута с параметрами
 * @returns Observable с массивом данных [траектория, пользовательская информация, навыки]
 */

/**
 * Функция-резолвер для получения детальной информации о траектории
 * @param route - снимок маршрута содержащий параметр trackId
 * @returns Observable с объединенными данными о траектории
 */
export const TrajectoryDetailResolver = (route: ActivatedRouteSnapshot) => {
  const trajectoryService = inject(TrajectoriesService);
  const trajectoryId = route.params["trackId"];

  return forkJoin([
    trajectoryService.getOne(trajectoryId),
    trajectoryService.getUserTrajectoryInfo(),
    trajectoryService.getIndividualSkills(),
  ]);
};
