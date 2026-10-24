/** @format */

import { Routes } from "@angular/router";
import { ProgramListComponent } from "../../pages/program/detail/list/list.component";
import { ProgramDetailResolver } from "../../pages/program/detail/detail.resolver";
import { DeatilComponent } from "@ui/widgets/detail/detail.component";
import { ProgramDetailMainComponent } from "@ui/pages/program/detail/main/main.component";
import { ProgramProjectsResolver } from "@ui/pages/program/detail/list/projects.resolver";
import { ProgramMembersResolver } from "@ui/pages/program/detail/list/members.resolver";
import { ProgramDetailMainUIInfoService } from "@api/program/facades/detail/ui/program-detail-main-ui-info.service";
import { ProgramAnalyticsComponent } from "@ui/pages/program/detail/analytics/analytics.component";
import { ProgramManagementComponent } from "@ui/pages/program/management/management.component";
import { canLeaveManagement } from "./management-leave.guard";
import { canLeaveSolution } from "./solution-leave.guard";
import { RatingWorkspaceComponent } from "@ui/pages/program/rating/rating-workspace.component";

/** Маршруты детальной страницы программы: информация, проекты и участники. */
export const PROGRAM_DETAIL_ROUTES: Routes = [
  ...["projects-rating", "projects-rating/:projectId"].map(path => ({
    path,
    component: RatingWorkspaceComponent,
    providers: [ProgramDetailMainUIInfoService],
    resolve: { data: ProgramDetailResolver },
    canDeactivate: [canLeaveManagement],
    runGuardsAndResolvers: "pathParamsChange" as const,
  })),
  {
    path: "solutions/new",
    canDeactivate: [canLeaveSolution],
    loadComponent: () =>
      import("@ui/pages/program/solution/solution.component").then(m => m.ProgramSolutionComponent),
  },
  {
    path: "solutions/:solutionId/edit",
    canDeactivate: [canLeaveSolution],
    loadComponent: () =>
      import("@ui/pages/program/solution/solution.component").then(m => m.ProgramSolutionComponent),
  },
  {
    path: "solutions/:solutionId",
    canDeactivate: [canLeaveSolution],
    loadComponent: () =>
      import("@ui/pages/program/solution/solution.component").then(m => m.ProgramSolutionComponent),
  },
  { path: "management", pathMatch: "full", redirectTo: "management/participants" },
  {
    path: "management/projects/:linkId/evaluation",
    component: ProgramManagementComponent,
    data: { managementSection: "evaluation" },
    canDeactivate: [canLeaveManagement],
    runGuardsAndResolvers: "always",
  },
  {
    path: "management/:section",
    component: ProgramManagementComponent,
    canDeactivate: [canLeaveManagement],
    runGuardsAndResolvers: "always",
  },
  {
    path: "",
    component: DeatilComponent,
    providers: [ProgramDetailMainUIInfoService],
    resolve: {
      data: ProgramDetailResolver,
    },
    // Перезапуск резолвера при смене :programId в SPA-навигации между программами
    // (иначе остаются данные предыдущей программы).
    runGuardsAndResolvers: "always",
    data: { listType: "program" },
    children: [
      {
        path: "",
        component: ProgramDetailMainComponent,
      },
      {
        path: "projects",
        component: ProgramListComponent,
        resolve: {
          data: ProgramProjectsResolver,
        },
        data: { listType: "projects" },
      },
      {
        path: "members",
        component: ProgramListComponent,
        resolve: {
          data: ProgramMembersResolver,
        },
        data: { listType: "members" },
      },
      {
        path: "analytics",
        component: ProgramAnalyticsComponent,
      },
    ],
  },
  {
    path: "register",
    pathMatch: "full",
    // Старые закладки не должны возвращать пользователя во встроенную форму регистрации.
    redirectTo: "",
  },
];
