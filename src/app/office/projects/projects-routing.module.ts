/** @format */

import { NgModule } from "@angular/core";
import { RouterModule, Routes, UrlMatchResult, UrlSegment } from "@angular/router";
import { ProjectsComponent } from "./projects.component";
import { ProjectsResolver } from "./projects.resolver";
import { ProjectsListComponent } from "./list/list.component";
import { ProjectsMyResolver } from "./list/my.resolver";
import { ProjectsAllResolver } from "./list/all.resolver";
import { ProjectEditComponent } from "./edit/edit.component";
import { ProjectEditResolver } from "./edit/edit.resolver";
import { ProjectsSubscriptionsResolver } from "./list/subscriptions.resolver";

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
    // matcher: projectEditMatcher,
  },
  {
    path: ":projectId",
    loadChildren: () => import("./detail/detail.module").then(m => m.ProjectDetailModule),
    // matcher: url =>
    //   isNaN(+url[0].path)
    //     ? null
    //     : { consumed: url, posParams: { projectId: new UrlSegment(url[0].path, {}) } },
  },
  // {
  //   path: "**",
  //   redirectTo: "/error/404",
  // },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectsRoutingModule {}

function projectEditMatcher(url: UrlSegment[]): UrlMatchResult | null {
  if (url.length < 2) {
    return null;
  }

  const projectId = url[0].path;
  if (url.length > 1 && !/^\d+$/.test(url[0].path)) {
    return null;
  }

  return {
    consumed: url.slice(0, 2),
    posParams: { projectId: new UrlSegment(projectId, {}) },
  };
}
