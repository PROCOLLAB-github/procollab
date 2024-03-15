/** @format */

import { Routes } from "@angular/router";
import { ProfileDetailComponent } from "./profile-detail.component";
import { ProfileDetailResolver } from "./profile-detail.resolver";
import { ProfileMainComponent } from "./main/main.component";
import { ProfileProjectsComponent } from "./projects/projects.component";

export const PROFILE_DETAIL_ROUTES: Routes = [
  {
    path: "",
    component: ProfileDetailComponent,
    resolve: {
      data: ProfileDetailResolver,
    },
    children: [
      {
        path: "",
        component: ProfileMainComponent,
      },
      {
        path: "projects",
        component: ProfileProjectsComponent,
      },
    ],
  },
];
