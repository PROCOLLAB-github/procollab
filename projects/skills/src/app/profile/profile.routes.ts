/** @format */

import { Routes } from "@angular/router";
import { ProfileComponent } from "./profile.component";
import { ProfileSkillsRatingComponent } from "./skills-rating/skills-rating.component";
import { profileResolver } from "./profile.resolver";
import { ProfileStudentsComponent } from "./students/students.component";
import { studentsResolver } from "./students/students.resolver";

export const PROFILE_ROUTES: Routes = [
  {
    path: "",
    component: ProfileComponent,
    resolve: { data: profileResolver },
    children: [
      {
        path: "",
        loadChildren: () => import("./home/profile-home.routes").then(m => m.PROFILE_HOME_ROUTES),
      },
      { path: "skills", component: ProfileSkillsRatingComponent },
      {
        path: "students",
        component: ProfileStudentsComponent,
        resolve: {
          students: studentsResolver,
        },
      },
    ],
  },
];
