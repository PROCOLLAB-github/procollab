/** @format */

import { Routes } from "@angular/router";
import { ProjectsComponent } from "./projects.component";
import { ProjectsResolver } from "./projects.resolver";
import { ProjectsListComponent } from "./list/list.component";
import { ProjectsMyResolver } from "./list/my.resolver";
import { ProjectsAllResolver } from "./list/all.resolver";
import { ProjectEditComponent } from "./edit/edit.component";
import { ProjectEditResolver } from "./edit/edit.resolver";
import { ProjectsSubscriptionsResolver } from "./list/subscriptions.resolver";

export const PROJECTS_ROUTES: Routes = [
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
        path: "subscriptions",
        component: ProjectsListComponent,
        resolve: {
          data: ProjectsSubscriptionsResolver,
        },
      },
      {
        path: "all",
        component: ProjectsListComponent,
        resolve: {
          data: ProjectsAllResolver,
        },
      },
    ],
  },
  {
    path: ":projectId/edit",
    component: ProjectEditComponent,
    resolve: {
      data: ProjectEditResolver,
    },
  },
  {
    path: ":projectId",
    loadChildren: () => import("./detail/detail.routes").then(c => c.PROJECT_DETAIL_ROUTES),
  },
];
