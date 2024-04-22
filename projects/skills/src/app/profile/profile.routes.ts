/** @format */

import { Routes } from "@angular/router";
import { ProfileComponent } from "./profile.component";
import { ProfileHomeComponent } from "./home/profile-home.component";
import { ProfileSkillsRatingComponent } from "./skills-rating/skills-rating.component";

export const PROFILE_ROUTES: Routes = [
  {
    path: "",
    component: ProfileComponent,
    children: [
      {
        path: "",
        loadChildren: () => import("./home/profile-home.routes").then(m => m.PROFILE_HOME_ROUTES),
      },
      { path: "skills", component: ProfileSkillsRatingComponent },
    ],
  },
];
