/** @format */

import { inject } from "@angular/core";
import { TrajectoriesService } from "../trajectories.service";

export const TrajectoriesMyResolver = () => {
  const trajectoriesService = inject(TrajectoriesService);

  return trajectoriesService.getMyTrajectory();
};
