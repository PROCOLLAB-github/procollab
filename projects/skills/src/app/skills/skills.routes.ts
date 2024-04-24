/** @format */

import { Routes } from "@angular/router";
import { SkillsListComponent } from "./list/list.component";

export const SKILLS_ROUTES: Routes = [
  { path: "", component: SkillsListComponent },
  {
    path: ":skillId",
    loadChildren: () => import("./detail/detail.routes").then(m => m.DETAIL_ROUTES),
  },
];
