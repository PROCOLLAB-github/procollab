/** @format */

import { inject } from "@angular/core";
import { ActivatedRoute, ActivatedRouteSnapshot } from "@angular/router";
import { TrajectoriesService } from "../../trajectories.service";
import { forkJoin } from "rxjs";

export const TrajectoryDetailResolver = (route: ActivatedRouteSnapshot) => {
  const trajectoryService = inject(TrajectoriesService);
  const trajectoryId = route.params["trackId"];

  return forkJoin([
    trajectoryService.getOne(trajectoryId),
    trajectoryService.getUserTrajectoryInfo(),
  ]);
};
