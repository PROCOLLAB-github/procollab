/** @format */

import { Routes } from "@angular/router";

export const PROGRAM_ROUTES: Routes = [
  {
    path: "list",
    loadChildren: () => import("./list/list.routes").then(c => c.PROGRAM_LIST_ROUTES),
  },
  {
    path: ":programId",
    loadChildren: () => import("./detail/detail.routes").then(c => c.PROGRAM_DETAIL_ROUTES),
  },
];
