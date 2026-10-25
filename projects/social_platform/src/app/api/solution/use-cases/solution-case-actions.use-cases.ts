/** @format */

import { inject, Injectable } from "@angular/core";
import { SolutionRepositoryPort } from "@domain/solution/ports/solution.repository.port";
import {
  SolutionCaseChangePreviewRequest,
  SolutionCaseChangeApplyRequest,
} from "@domain/solution/solution-contract.model";
import { solutionRequestResult } from "./solution.use-cases";

@Injectable({ providedIn: "root" })
export class PreviewSolutionCaseChangeUseCase {
  private readonly repository = inject(SolutionRepositoryPort);
  execute(programId: number, solutionId: number, command: SolutionCaseChangePreviewRequest) {
    return solutionRequestResult(() =>
      this.repository.previewCaseChange(programId, solutionId, command),
    );
  }
}

@Injectable({ providedIn: "root" })
export class ApplySolutionCaseChangeUseCase {
  private readonly repository = inject(SolutionRepositoryPort);
  execute(programId: number, solutionId: number, command: SolutionCaseChangeApplyRequest) {
    return solutionRequestResult(() =>
      this.repository.applyCaseChange(programId, solutionId, command),
    );
  }
}
