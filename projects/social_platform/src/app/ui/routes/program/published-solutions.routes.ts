/** @format */
import { Routes } from "@angular/router";
import { ProgramDetailMainUIInfoService } from "@api/program/facades/detail/ui/program-detail-main-ui-info.service";
import { ProgramDetailResolver } from "@ui/pages/program/detail/detail.resolver";
import { PublicProgramSolutionsComponent } from "@ui/pages/program/published-solutions/public-program-solutions.component";

/** These exact read-only paths are public; the remaining office routes keep AuthRequiredGuard. */
export const PUBLISHED_SOLUTION_ROUTES: Routes = [
  "office/program/:programId/published-solutions",
  "office/program/:programId/published-solutions/:solutionId",
].map(path => ({
  path,
  component: PublicProgramSolutionsComponent,
  providers: [ProgramDetailMainUIInfoService],
  resolve: { data: ProgramDetailResolver },
  runGuardsAndResolvers: "pathParamsChange",
  data: { listType: "program" },
  children: [
    {
      path: "",
      loadComponent: () =>
        import("@ui/pages/program/published-solutions/published-solutions.component").then(
          m => m.PublishedSolutionsComponent,
        ),
    },
  ],
}));
