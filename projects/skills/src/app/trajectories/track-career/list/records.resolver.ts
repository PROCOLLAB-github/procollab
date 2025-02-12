/** @format */

import { inject } from "@angular/core";
import { TrajectoriesService } from "../../trajectories.service";

export const MyTrajectoriesResolver = () => {
  const trajectoriesService = inject(TrajectoriesService);

  return trajectoriesService.getTrajectories(20, 0);
};
