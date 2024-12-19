/** @format */

import { Routes } from "@angular/router";
import { WebinarsComponent } from "./webinars.component";
import { webinarsResolver } from "./webinars.resolver";
import { WebinarsListComponent } from "./list/list.component";

export const WEBINARS_ROUTES: Routes = [
  {
    path: "",
    component: WebinarsComponent,
    children: [
      {
        path: "",
        component: WebinarsListComponent,
        resolve: {
          data: webinarsResolver,
        },
      },
      {
        path: "records",
        loadChildren: () => import("./list/list.routes").then(c => c.RECORDS_ROUTES),
      },
    ],
  },
];
