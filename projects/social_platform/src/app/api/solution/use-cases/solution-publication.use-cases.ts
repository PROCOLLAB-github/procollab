/** @format */

import { inject, Injectable } from "@angular/core";
import {
  SolutionPublishedQuery,
  SolutionRepositoryPort,
} from "@domain/solution/ports/solution.repository.port";
import { solutionRequestResult } from "./solution.use-cases";

@Injectable({ providedIn: "root" })
export class GetPublishedSolutionsUseCase {
  private readonly repository = inject(SolutionRepositoryPort);
  execute(programId: number, query?: SolutionPublishedQuery) {
    return solutionRequestResult(() => this.repository.publishedSolutions(programId, query));
  }
}

@Injectable({ providedIn: "root" })
export class GetPublishedSolutionUseCase {
  private readonly repository = inject(SolutionRepositoryPort);
  execute(programId: number, solutionId: number) {
    return solutionRequestResult(() => this.repository.publishedSolution(programId, solutionId));
  }
}
