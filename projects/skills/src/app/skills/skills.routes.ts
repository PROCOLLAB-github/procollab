/** @format */

import { Routes } from "@angular/router";
import { SkillDetailComponent } from "./detail/detail.component";
import { SkillsListComponent } from "./list/list.component";

export const SKILLS_ROUTES: Routes = [
  { path: "", component: SkillsListComponent },
  {
    path: ":skillId",
    loadChildren: () => import("./detail/detail.routes").then(m => m.DETAIL_ROUTES),
  },
];
