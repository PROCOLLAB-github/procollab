/** @format */
import { TrajectoryInfoComponent } from "./info/info.component";
import { TrajectoryDetailComponent } from "./trajectory-detail.component";

export const TRAJECTORY_DETAIL_ROUTES = [
  {
    path: "",
    component: TrajectoryDetailComponent,

    children: [
      {
        path: "",
        component: TrajectoryInfoComponent,
      },
    ],
  },
];
