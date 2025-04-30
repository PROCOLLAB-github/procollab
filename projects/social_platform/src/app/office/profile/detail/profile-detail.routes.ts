/** @format */

import { Routes } from "@angular/router";
import { ProfileDetailComponent } from "./profile-detail.component";
import { ProfileDetailResolver } from "./profile-detail.resolver";
import { ProfileMainComponent } from "./main/main.component";
import { ProfileProjectsComponent } from "./projects/projects.component";
import { ProfileMainResolver } from "./main/main.resolver";
import { ProfileNewsComponent } from "../profile-news/profile-news.component";

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
        path: "news/:newsId",
        component: ProfileNewsComponent,
        resolve: {
          data: ProfileMainResolver,
        },
      },
      {
        path: "projects",
        component: ProfileProjectsComponent,
      },
    ],
  },
];
