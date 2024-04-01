/** @format */

import { Routes } from "@angular/router";
import { ProfileComponent } from "./profile.component";
import { SkillsComponent } from "./skills/skills.component";

export const PROFILE_ROUTES: Routes = [
  { path: "", component: ProfileComponent, children: [{ path: "", component: SkillsComponent }] },
];
