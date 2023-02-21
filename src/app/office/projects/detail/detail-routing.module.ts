/** @format */

import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { ProjectInfoComponent } from "./info/info.component";
import { ProjectInfoResolver } from "./info/info.resolver";
import { ProjectResponsesComponent } from "./responses/responses.component";
import { ProjectResponsesResolver } from "./responses/responses.resolver";
import { ProjectDetailComponent } from "./detail.component";
import { ProjectChatComponent } from "./chat/chat.component";

const routes: Routes = [
  {
    path: "",
    component: ProjectDetailComponent,
    children: [
      {
        path: "",
        component: ProjectInfoComponent,
        resolve: {
          data: ProjectInfoResolver,
        },
      },
      {
        path: "responses",
        component: ProjectResponsesComponent,
        resolve: {
          data: ProjectResponsesResolver,
        },
      },
      {
        path: "chat",
        component: ProjectChatComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectDetailRoutingModule {}
