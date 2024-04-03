/** @format */

import { Routes } from "@angular/router";

export const routes: Routes = [
  {
    path: "",
    pathMatch: "full",
    redirectTo: "profile",
  },
  {
    path: "profile",
    loadChildren: () => import("./profile/profile.routes").then(c => c.PROFILE_ROUTES),
  },
  {
    path: "skills",
    loadChildren: () => import("./skills/skills.routes").then(c => c.SKILLS_ROUTES),
  },
];
