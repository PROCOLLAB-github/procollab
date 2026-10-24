/** @format */

import { SolutionApplicationRef } from "@domain/solution/solution-contract.model";
import { AppRoutes } from "@api/paths/app-routes";

/** Контекст передается явно; ID проекта, связи программы и решения не взаимозаменяемы. */
export function solutionApplicationRoute(application: SolutionApplicationRef) {
  return application.kind === "solution"
    ? {
        path: AppRoutes.program.solution(application.programId, application.solutionId),
        queryParams: {},
      }
    : {
        path: AppRoutes.projects.edit(application.projectId),
        queryParams: {
          editingStep: "additional",
          fromProgram: true,
          programLinkId: application.programLinkId,
        },
      };
}
