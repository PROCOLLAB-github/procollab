/** @format */

import { Routes } from "@angular/router";
import { KanbanBoardComponent } from "./board/kanban-board.component";
import { KanbanArhiveComponent } from "./archive/kanban-archive.component";

export const KANBAN_ROUTES: Routes = [
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
