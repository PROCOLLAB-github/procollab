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
