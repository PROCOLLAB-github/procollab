/** @format */

import { Routes } from "@angular/router";
import { ProjectsComponent } from "../../pages/projects/projects.component";
import { ProjectsResolver } from "../../pages/projects/projects.resolver";
import { ProjectsListComponent } from "../../pages/projects/list/list.component";
import { ProjectsMyResolver } from "../../pages/projects/list/my.resolver";
import { ProjectsAllResolver } from "../../pages/projects/list/all.resolver";
import { ProjectEditComponent } from "../../pages/projects/edit/edit.component";
import { ProjectEditResolver } from "../../pages/projects/edit/edit.resolver";
import { ProjectEditRequiredGuard } from "../../../../../../core/src/lib/guards/projects-edit/projects-edit.guard";
import { DashboardProjectsComponent } from "../../pages/projects/dashboard/dashboard.component";

/** Маршруты модуля проектов: dashboard, список, редактирование, детали (lazy). */
export const PROJECTS_ROUTES: Routes = [
  {
    path: "",
    component: ProjectsComponent,
    children: [
      {
        path: "",
        pathMatch: "full",
        redirectTo: "dashboard",
      },
      {
        path: "dashboard",
        component: DashboardProjectsComponent,
        resolve: {
          data: ProjectsResolver,
        },
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
      },
      {
        path: "invites",
        component: ProjectsListComponent,
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
    canActivate: [ProjectEditRequiredGuard],
  },
  {
    path: ":projectId",
    loadChildren: () => import("./detail.routes").then(c => c.PROJECT_DETAIL_ROUTES),
  },
];
