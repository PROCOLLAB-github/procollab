/** @format */

import { Routes } from "@angular/router";

export const KANBAN_ROUTES: Routes = [
  {
    path: ":kanbanId",
    loadChildren: () => import("./kanban-detail.routes").then(c => c.KANBAN_DETAIL_ROUTES),
  },
];
