/** @format */
import { resolve } from "dns";
import { TrajectoryInfoComponent } from "./info/info.component";
import { TrajectoryDetailComponent } from "./trajectory-detail.component";
import { TrajectoryDetailResolver } from "./trajectory-detail.resolver";

export const TRAJECTORY_DETAIL_ROUTES = [
  {
    path: "",
    component: TrajectoryDetailComponent,

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
