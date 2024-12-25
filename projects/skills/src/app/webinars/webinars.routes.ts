/** @format */

import { Routes } from "@angular/router";
import { WebinarsComponent } from "./webinars.component";
import { WebinarsResolver } from "./webinars.resolver";
import { WebinarsListComponent } from "./list/list.component";

export const WEBINARS_ROUTES: Routes = [
  {
    path: "",
    component: WebinarsComponent,
    children: [
      {
        path: "",
        redirectTo: "actual",
        pathMatch: "full",
      },
      {
        path: "actual",
        component: WebinarsListComponent,
        resolve: {
          data: WebinarsResolver,
        },
      },
      {
        path: "records",
        loadChildren: () => import("./list/list.routes").then(c => c.RECORDS_ROUTES),
      },
    ],
  },
];
