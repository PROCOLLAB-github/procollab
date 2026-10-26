/** @format */

import { inject, Injectable } from "@angular/core";
import { SolutionRepositoryPort } from "@domain/solution/ports/solution.repository.port";
import {
  SolutionMemberRemovalPreviewRequest,
  SolutionMemberRemovalApplyRequest,
} from "@domain/solution/solution-contract.model";
import { solutionRequestResult } from "./solution.use-cases";

@Injectable({ providedIn: "root" })
export class PreviewSolutionMemberRemovalUseCase {
  private readonly repository = inject(SolutionRepositoryPort);
  execute(programId: number, solutionId: number, command: SolutionMemberRemovalPreviewRequest) {
    return solutionRequestResult(() =>
      this.repository.previewMemberRemoval(programId, solutionId, command),
    );
  }
}

@Injectable({ providedIn: "root" })
export class ApplySolutionMemberRemovalUseCase {
  private readonly repository = inject(SolutionRepositoryPort);
  execute(programId: number, solutionId: number, command: SolutionMemberRemovalApplyRequest) {
    return solutionRequestResult(() =>
      this.repository.applyMemberRemoval(programId, solutionId, command),
    );
  }
}
