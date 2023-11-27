/** @format */

import { Routes } from "@angular/router";
import { OfficeComponent } from "./office.component";
import { ProfileEditComponent } from "./profile/edit/edit.component";
import { MembersComponent } from "./members/members.component";
import { MembersResolver } from "./members/members.resolver";
import { VacancySendComponent } from "./vacancy/send/send.component";
import { OfficeResolver } from "./office.resolver";
import { MentorsComponent } from "./mentors/mentors.component";
import { MentorsResolver } from "./mentors/mentors.resolver";

export const OFFICE_ROUTES: Routes = [
  {
    path: "onboarding",
    loadChildren: () => import("./onboarding/onboarding.routes").then(c => c.ONBOARDING_ROUTES),
  },
  {
    path: "",
    component: OfficeComponent,
    resolve: {
      invites: OfficeResolver,
    },
    children: [
      {
        path: "",
        pathMatch: "full",
        redirectTo: "projects",
      },
      {
        path: "projects",
        loadChildren: () => import("./projects/projects.routes").then(c => c.PROJECTS_ROUTES),
      },
      {
        path: "program",
        loadChildren: () => import("./program/program.routes").then(c => c.PROGRAM_ROUTES),
      },
      {
        path: "vacancy/:vacancyId",
        component: VacancySendComponent,
      },
      {
        path: "chats",
        loadChildren: () => import("./chat/chat.routes").then(c => c.CHAT_ROUTES),
      },
      {
        path: "members",
        component: MembersComponent,
        resolve: {
          data: MembersResolver,
        },
      },
      {
        path: "mentors",
        component: MentorsComponent,
        resolve: {
          data: MentorsResolver,
        },
      },
      {
        path: "profile/edit",
        component: ProfileEditComponent,
      },
      {
        path: "profile/:id",
        loadChildren: () =>
          import("./profile/detail/profile-detail.routes").then(c => c.PROFILE_DETAIL_ROUTES),
      },
      {
        path: "**",
        redirectTo: "/error/404",
      },
    ],
  },
];
