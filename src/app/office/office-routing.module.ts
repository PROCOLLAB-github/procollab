/** @format */

import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { OfficeComponent } from "./office.component";
import { ProjectsComponent } from "./projects/projects.component";
import { ChatComponent } from "./chat/chat.component";
import { ProfileDetailComponent } from "./profile/detail/profile-detail.component";
import { ProfileEditComponent } from "./profile/edit/edit.component";
import { ProfileDetailResolver } from "./profile/detail/profile-detail.resolver";
import { MembersComponent } from "./members/members.component";
import { MembersResolver } from "./members/members.resolver";
import { ProjectsResolver } from "./projects/projects.resolver";
import { ProjectsListComponent } from "./projects/list/list.component";
import { ProjectsMyResolver } from "./projects/list/my.resolver";
import { ProjectsAllResolver } from "./projects/list/all.resolver";
import { ProjectDetailComponent } from "./projects/detail/detail.component";
import { ProjectDetailResolver } from "./projects/detail/detail.resolver";
import { ProjectEditComponent } from "./projects/edit/edit.component";
import { ProjectEditResolver } from "./projects/edit/edit.resolver";
import { VacancySendComponent } from "./vacancy/send/send.component";
import { OfficeResolver } from "./office.resolver";
import { ProjectResponsesComponent } from "./projects/responses/responses.component";
import { ProjectResponsesResolver } from "./projects/responses/responses.resolver";
import { MentorsComponent } from "./mentors/mentors.component";
import { MentorsResolver } from "./mentors/mentors.resolver";

const routes: Routes = [
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
        component: ProjectsComponent,
        resolve: {
          data: ProjectsResolver,
        },
        children: [
          {
            path: "",
            pathMatch: "full",
            redirectTo: "my",
          },
          {
            path: "my",
            component: ProjectsListComponent,
            resolve: {
              data: ProjectsMyResolver,
            },
          },
          {
            path: "all",
            component: ProjectsListComponent,
            resolve: {
              data: ProjectsAllResolver,
            },
          },
          {
            path: ":projectId/edit",
            component: ProjectEditComponent,
            resolve: {
              data: ProjectEditResolver,
            },
          },
        ],
      },
      {
        path: "projects/:projectId",
        component: ProjectDetailComponent,
        resolve: {
          data: ProjectDetailResolver,
        },
      },
      {
        path: "projects/:projectId/responses",
        component: ProjectResponsesComponent,
        resolve: {
          data: ProjectResponsesResolver,
        },
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
