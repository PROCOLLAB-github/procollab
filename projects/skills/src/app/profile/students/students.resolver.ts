/** @format */

import { inject } from "@angular/core";
import { TrajectoriesService } from "../../trajectories/trajectories.service";

export const studentsResolver = () => {
  const trajectoryService = inject(TrajectoriesService);
  return trajectoryService.getMentorStudents();
};
