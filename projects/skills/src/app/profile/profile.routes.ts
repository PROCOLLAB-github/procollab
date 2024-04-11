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
      { path: "", component: ProfileHomeComponent },
      { path: "skills", component: ProfileSkillsRatingComponent },
    ],
  },
];
