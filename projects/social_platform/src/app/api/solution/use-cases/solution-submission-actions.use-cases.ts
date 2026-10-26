/** @format */

import { inject, Injectable } from "@angular/core";
import { SolutionRepositoryPort } from "@domain/solution/ports/solution.repository.port";
import {
  SolutionActionPreviewRequest,
  SolutionActionApplyRequest,
} from "@domain/solution/solution-contract.model";
import { solutionRequestResult } from "./solution.use-cases";

@Injectable({ providedIn: "root" })
export class PreviewSolutionSubmitActionUseCase {
  private readonly repository = inject(SolutionRepositoryPort);
  execute(programId: number, command: SolutionActionPreviewRequest) {
    return solutionRequestResult(() => this.repository.previewSubmitAction(programId, command));
  }
}

@Injectable({ providedIn: "root" })
export class ApplySolutionSubmitActionUseCase {
  private readonly repository = inject(SolutionRepositoryPort);
  execute(programId: number, command: SolutionActionApplyRequest) {
    return solutionRequestResult(() => this.repository.applySubmitAction(programId, command));
  }
}
