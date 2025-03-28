/** @format */

import { Routes } from "@angular/router";
import { TrackCareerComponent } from "./track-career.component";
import { TrajectoriesListComponent } from "./list/list.component";
import { TrajectoriesResolver } from "./track-career.resolver";
import { TrajectoriesMyResolver } from "./track-career-my.resolver";

export const TRACK_CAREER_ROUTES: Routes = [
  {
    path: "",
    component: TrackCareerComponent,
    children: [
      {
        path: "",
        redirectTo: "all",
        pathMatch: "full",
      },
      {
        path: "all",
        component: TrajectoriesListComponent,
        resolve: {
          data: TrajectoriesResolver,
        },
      },
      {
        path: "my",
        component: TrajectoriesListComponent,
        resolve: {
          data: TrajectoriesMyResolver,
        },
      },
    ],
  },
  {
    path: ":trackId",
    loadChildren: () =>
      import("./detail/trajectory-detail.routes").then(c => c.TRAJECTORY_DETAIL_ROUTES),
  },
];
