/** @format */

import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { OfficeComponent } from "./office.component";
import { ChatComponent } from "./chat/chat.component";
import { ProfileDetailComponent } from "./profile/detail/profile-detail.component";
import { ProfileEditComponent } from "./profile/edit/edit.component";
import { ProfileDetailResolver } from "./profile/detail/profile-detail.resolver";
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
        path: "vacancy/:vacancyId",
        component: VacancySendComponent,
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
        path: "chat",
        component: ChatComponent,
      },
      {
        path: "profile/edit",
        component: ProfileEditComponent,
      },
      {
        path: "profile/:id",
        component: ProfileDetailComponent,
        resolve: {
          data: ProfileDetailResolver,
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OfficeRoutingModule {}
