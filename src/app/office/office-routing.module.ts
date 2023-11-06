/** @format */

import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { OfficeComponent } from "./office.component";
import { ProfileEditComponent } from "./profile/edit/edit.component";
import { MembersComponent } from "./members/members.component";
import { MembersResolver } from "./members/members.resolver";
import { VacancySendComponent } from "./vacancy/send/send.component";
import { OfficeResolver } from "./office.resolver";
import { MentorsComponent } from "./mentors/mentors.component";
import { MentorsResolver } from "./mentors/mentors.resolver";

const routes: Routes = [
  {
    path: "onboarding",
    loadChildren: () => import("./onboarding/onboarding.module").then(m => m.OnboardingModule),
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
        loadChildren: () => import("./projects/projects.module").then(m => m.ProjectsModule),
      },
      {
        path: "program",
        loadChildren: () => import("./program/program.module").then(m => m.ProgramModule),
      },
      {
        path: "vacancy/:vacancyId",
        component: VacancySendComponent,
      },
      {
        path: "chats",
        loadChildren: () => import("./chat/chat.module").then(m => m.ChatModule),
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
          import("./profile/detail/profile-detail.module").then(m => m.ProfileDetailModule),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OfficeRoutingModule {}
