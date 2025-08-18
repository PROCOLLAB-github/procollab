/** @format */

import { TrajectoryInfoRequiredGuard } from "./info/guards/trajectory-info.guard";
import { TrajectoryInfoComponent } from "./info/info.component";
import { TrajectoryDetailComponent } from "./trajectory-detail.component";
import { TrajectoryDetailResolver } from "./trajectory-detail.resolver";

export const TRAJECTORY_DETAIL_ROUTES = [
  {
    path: "",
    component: TrajectoryDetailComponent,
    canActivate: [TrajectoryInfoRequiredGuard],

    children: [
      {
        path: "",
        component: TrajectoryInfoComponent,
        resolve: {
          data: TrajectoryDetailResolver,
        },
      },
    ],
  },
];
