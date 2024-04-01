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
];
