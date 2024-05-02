/** @format */

import { Routes } from "@angular/router";
import { SkillsListComponent } from "./list/list.component";
import { skillsListResolver } from "./list/list.resolver";

export const SKILLS_ROUTES: Routes = [
  { path: "", component: SkillsListComponent, resolve: { data: skillsListResolver } },
  {
    path: ":skillId",
    loadChildren: () => import("./detail/detail.routes").then(m => m.DETAIL_ROUTES),
  },
];
