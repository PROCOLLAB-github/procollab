/** @format */

import { Routes } from "@angular/router";
import { ProgramComponent } from "./program.component";
import { ProgramMainComponent } from "./list/main/main.component";
import { ProgramMainResolver } from "./list/main/main.resolver";

export const PROGRAM_ROUTES: Routes = [
  {
    path: "",
    component: ProgramComponent,
    children: [
      {
        path: "",
        pathMatch: "full",
        redirectTo: "all",
      },
      // {
      //   path: "my",
      //   component: ProgramMainComponent,
      //   resolve: {
      //     data: ProgramMainResolver,
      //   },
      // },
      {
        path: "all",
        component: ProgramMainComponent,
        resolve: {
          data: ProgramMainResolver,
        },
      },
    ],
  },
  {
    path: ":programId",
    loadChildren: () => import("./detail/detail.routes").then(c => c.PROGRAM_DETAIL_ROUTES),
  },
  {
    path: ":programId/projects-rating",
    loadChildren: () =>
      import("./detail/rate-projects/rate-project.routes").then(c => c.RATE_PROJECTS_ROUTES),
  },
];
