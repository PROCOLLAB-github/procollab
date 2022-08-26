/** @format */

import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { OfficeComponent } from "./office.component";
import { ProjectsComponent } from "./projects/projects.component";
import { PeopleComponent } from "./people/people.component";
import { ChatComponent } from "./chat/chat.component";
import { NewsComponent } from "./news/news.component";
import { ProfileDetailComponent } from "./profile/derail/profile-detail.component";
import { ProfileEditComponent } from "./profile/edit/profile-edit.component";

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
      },
      {
        path: "people",
        component: PeopleComponent,
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
        path: "profile/:id",
        component: ProfileDetailComponent,
      },
      {
        path: "profile/edit",
        component: ProfileEditComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OfficeRoutingModule {}
