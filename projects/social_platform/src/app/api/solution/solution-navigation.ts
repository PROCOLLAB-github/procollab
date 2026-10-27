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

export function solutionCreationBlockedMessage(reason: string | null): string {
  if (reason === "form_not_configured")
    return "Организатор еще настраивает форму решения. Подать решение можно будет позже.";
  return reason === "solution_creation_disabled"
    ? "Создание новых решений временно приостановлено. Ранее созданные заявки доступны."
    : "Создание заявки сейчас недоступно. Проверьте регистрацию и сроки программы.";
}
