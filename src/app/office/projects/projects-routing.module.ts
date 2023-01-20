/** @format */

import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ProjectsComponent } from "./projects.component";
import { ProjectsResolver } from "./projects.resolver";
import { ProjectsListComponent } from "./list/list.component";
import { ProjectsMyResolver } from "./list/my.resolver";
import { ProjectsAllResolver } from "./list/all.resolver";
import { ProjectEditComponent } from "./edit/edit.component";
import { ProjectEditResolver } from "./edit/edit.resolver";
import { ProjectDetailComponent } from "./detail/detail.component";
import { ProjectDetailResolver } from "./detail/detail.resolver";
import { ProjectResponsesComponent } from "./responses/responses.component";
import { ProjectResponsesResolver } from "./responses/responses.resolver";

const routes: Routes = [
  {
    path: "",
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
    path: ":projectId",
    component: ProjectDetailComponent,
    resolve: {
      data: ProjectDetailResolver,
    },
  },
  {
    path: ":projectId/responses",
    component: ProjectResponsesComponent,
    resolve: {
      data: ProjectResponsesResolver,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectsRoutingModule {}
