/** @format */

import { Routes } from "@angular/router";
import { recordsResolver } from "./records.resolver";
import { WebinarsListComponent } from "./list.component";

export const RECORDS_ROUTES: Routes = [
  {
    path: "",
    component: WebinarsListComponent,
    resolve: {
      data: recordsResolver,
    },
  },
];
