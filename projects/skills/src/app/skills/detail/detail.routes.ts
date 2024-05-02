/** @format */

import { Routes } from "@angular/router";
import { SkillDetailComponent } from "./detail.component";
import { skillDetailResolver } from "./detail.resolver";

export const DETAIL_ROUTES: Routes = [
  {
    path: "",
    component: SkillDetailComponent,
    resolve: {
      data: skillDetailResolver,
    },
  },
];
