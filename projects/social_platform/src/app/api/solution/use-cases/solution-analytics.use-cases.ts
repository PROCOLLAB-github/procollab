/** @format */

import { inject, Injectable } from "@angular/core";
import { SolutionRepositoryPort } from "@domain/solution/ports/solution.repository.port";
import { solutionRequestResult } from "./solution.use-cases";

@Injectable({ providedIn: "root" })
export class GetSolutionCaseAnalyticsUseCase {
  private readonly repository = inject(SolutionRepositoryPort);
  execute(programId: number) {
    return solutionRequestResult(() => this.repository.caseAnalytics(programId));
  }
}
