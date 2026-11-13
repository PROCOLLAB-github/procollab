/** @format */

import { convertToParamMap, RedirectFunction, Router, Routes } from "@angular/router";
import { inject } from "@angular/core";
import { AppRoutes } from "@api/paths/app-routes";
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
import { ProgramProjectsPageComponent } from "@ui/pages/program/published-solutions/published-projects.component";
import { cabinetReturnUrl } from "@api/program/evaluation-navigation.service";

const redirectProjectRating: RedirectFunction = ({ params, queryParams: query }) => {
  const router = inject(Router);
  const queryParamMap = convertToParamMap(query);
  const programId = params["programId"];
  const projectId = Number(params["projectId"] ?? queryParamMap.get("project_id"));
  if (Number.isSafeInteger(projectId) && projectId > 0) {
    return router.createUrlTree([AppRoutes.office.projectEvaluation(programId, projectId)], {
      queryParams: { returnUrl: cabinetReturnUrl(queryParamMap.get("returnUrl"), programId) },
    });
  }
  const queryParams: Record<string, string | string[]> = { program: programId };
  if (queryParamMap.get("status") === "completed") queryParams["tab"] = "completed";
  const search = queryParamMap.get("q") ?? queryParamMap.get("name__contains");
  if (search) queryParams["q"] = search;
  for (const key of queryParamMap.keys) {
    if (key.startsWith("filter.")) queryParams[key] = queryParamMap.getAll(key);
  }
  return router.createUrlTree([AppRoutes.office.evaluation()], { queryParams });
};

/** Маршруты детальной страницы программы: информация, проекты и участники. */
export const PROGRAM_DETAIL_ROUTES: Routes = [
  {
    path: "solutions-rating",
    providers: [ProgramDetailMainUIInfoService],
    resolve: { data: ProgramDetailResolver },
    runGuardsAndResolvers: "pathParamsChange",
    loadComponent: () =>
      import("@ui/pages/program/solution-evaluation/solution-evaluation-list.component").then(
        m => m.SolutionEvaluationListComponent,
      ),
  },
  {
    path: "solutions/:solutionId/evaluation",
    canDeactivate: [canLeaveManagement],
    loadComponent: () =>
      import("@ui/pages/program/solution-evaluation/solution-evaluation.component").then(
        m => m.SolutionEvaluationComponent,
      ),
  },
  ...["projects-rating", "projects-rating/:projectId"].map(path => ({
    path,
    pathMatch: "full" as const,
    redirectTo: redirectProjectRating,
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
      ...["published-solutions", "published-solutions/:solutionId"].map(path => ({
        path,
        loadComponent: () =>
          import("@ui/pages/program/published-solutions/published-solutions.component").then(
            m => m.PublishedSolutionsComponent,
          ),
      })),
      {
        path: "",
        component: ProgramDetailMainComponent,
      },
      {
        path: "projects",
        component: ProgramProjectsPageComponent,
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
