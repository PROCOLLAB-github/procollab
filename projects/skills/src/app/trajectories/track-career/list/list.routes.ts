/** @format */

import { Routes } from "@angular/router";
import { MyTrajectoriesResolver } from "./records.resolver";
import { TrajectoriesListComponent } from "./list.component";

export const MY_TRAJECTORIES_ROUTES: Routes = [
  {
    path: "",
    component: TrajectoriesListComponent,
    resolve: {
      data: MyTrajectoriesResolver,
    },
  },
];
