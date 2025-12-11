/** @format */

import { Routes } from "@angular/router";
import { KanbanArhiveComponent } from "@ui/pages/projects/detail/kanban/pages/archive/kanban-archive.component";
import { KanbanBoardComponent } from "@ui/pages/projects/detail/kanban/pages/board/kanban-board.component";

export const KANBAN_DETAIL_ROUTES: Routes = [
  { path: "", pathMatch: "full", redirectTo: "board" },
  {
    path: "board",
    component: KanbanBoardComponent,
  },
  {
    path: "archive",
    component: KanbanArhiveComponent,
  },
];
