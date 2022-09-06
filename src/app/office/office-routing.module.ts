/** @format */

import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { OfficeComponent } from "./office.component";
import { ProjectsComponent } from "./projects/projects.component";
import { ChatComponent } from "./chat/chat.component";
import { NewsComponent } from "./news/news.component";
import { ProfileDetailComponent } from "./profile/detail/profile-detail.component";
import { ProfileEditComponent } from "./profile/edit/profile-edit.component";
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

const routes: Routes = [
  {
    path: "",
    component: OfficeComponent,
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
            path: ":projectId",
            component: ProjectDetailComponent,
            resolve: {
              data: ProjectDetailResolver,
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
        path: "members",
        component: MembersComponent,
        resolve: {
          data: MembersResolver,
        },
      },
      {
        path: "chat",
        component: ChatComponent,
      },
      {
        path: "news",
        component: NewsComponent,
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
