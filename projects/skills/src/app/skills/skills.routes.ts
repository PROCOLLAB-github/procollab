/** @format */

import { Routes } from "@angular/router";
import { SkillDetailComponent } from "./detail/detail.component";

export const SKILLS_ROUTES: Routes = [{ path: ":skillId", component: SkillDetailComponent }];
