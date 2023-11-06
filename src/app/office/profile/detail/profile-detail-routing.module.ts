/** @format */

import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { ProfileDetailComponent } from "./profile-detail.component";
import { ProfileDetailResolver } from "./profile-detail.resolver";
import { ProfileMainComponent } from "./main/main.component";
import { ProfileProjectsComponent } from "./projects/projects.component";

const routes: Routes = [
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

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfileDetailRoutingModule {}
