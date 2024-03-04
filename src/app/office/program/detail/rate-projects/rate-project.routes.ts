/** @format */

import { Routes } from "@angular/router";
import { RateProjectsComponent } from "@office/program/detail/rate-projects/rate-projects.component";
import { ListComponent } from "./list/list.component";
import { ListAllResolver } from "./list/list-all.resolver";
import { ListRatedResolver } from "./list/list-rated.resolver";

export const RATE_PROJECTS_ROUTES: Routes = [
  {
    path: "",
    component: RateProjectsComponent,
    children: [
      {
        path: "",
        redirectTo: "all",
        pathMatch: "full",
      },
      {
        path: "all",
        component: ListComponent,
        resolve: {
          data: ListAllResolver,
        },
      },
      {
        path: "rated",
        component: ListComponent,
        resolve: {
          data: ListRatedResolver,
        },
      },
    ],
  },
];
