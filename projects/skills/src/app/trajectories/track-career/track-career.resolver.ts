/** @format */

import { inject } from "@angular/core";
import { TrajectoriesService } from "../trajectories.service";

export const TrajectoriesResolver = () => {
  const trajectoriesService = inject(TrajectoriesService);

  return trajectoriesService.getTrajectories(20, 0);
};
