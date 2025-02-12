/** @format */

import { inject } from "@angular/core";
import { ActivatedRoute, ActivatedRouteSnapshot } from "@angular/router";
import { VacancyService } from "@office/services/vacancy.service";
import { map, tap } from "rxjs";
import { TrajectoriesService } from "../../trajectories.service";

export const TrajectoryDetailResolver = (route: ActivatedRouteSnapshot) => {
  const trajectoryService = inject(TrajectoriesService);
  const trajectoryId = route.params["trackId"];

  return trajectoryService.getOne(trajectoryId);
};
