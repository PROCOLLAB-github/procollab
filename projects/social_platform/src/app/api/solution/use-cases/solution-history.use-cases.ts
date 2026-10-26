/** @format */

import { inject, Injectable } from "@angular/core";
import {
  SolutionHistoryQuery,
  SolutionRepositoryPort,
} from "@domain/solution/ports/solution.repository.port";
import { solutionRequestResult } from "./solution.use-cases";

@Injectable({ providedIn: "root" })
export class ListSolutionAdminChangesUseCase {
  private readonly repository = inject(SolutionRepositoryPort);
  execute(programId: number, solutionId: number, query?: SolutionHistoryQuery) {
    return solutionRequestResult(() =>
      this.repository.listAdministrativeChanges(programId, solutionId, query),
    );
  }
}

@Injectable({ providedIn: "root" })
export class ReadSolutionAdminChangeUseCase {
  private readonly repository = inject(SolutionRepositoryPort);
  execute(programId: number, solutionId: number, changeId: number) {
    return solutionRequestResult(() =>
      this.repository.readAdministrativeChange(programId, solutionId, changeId),
    );
  }
}
