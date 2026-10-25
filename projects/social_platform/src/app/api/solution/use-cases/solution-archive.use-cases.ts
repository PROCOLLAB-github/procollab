/** @format */

import { inject, Injectable } from "@angular/core";
import { SolutionRepositoryPort } from "@domain/solution/ports/solution.repository.port";
import {
  SolutionArchivePreviewRequest,
  SolutionArchiveApplyRequest,
} from "@domain/solution/solution-contract.model";
import { solutionRequestResult } from "./solution.use-cases";

@Injectable({ providedIn: "root" })
export class PreviewSolutionArchiveUseCase {
  private readonly repository = inject(SolutionRepositoryPort);
  execute(programId: number, command: SolutionArchivePreviewRequest) {
    return solutionRequestResult(() => this.repository.previewArchive(programId, command));
  }
}

@Injectable({ providedIn: "root" })
export class ApplySolutionArchiveUseCase {
  private readonly repository = inject(SolutionRepositoryPort);
  execute(programId: number, command: SolutionArchiveApplyRequest) {
    return solutionRequestResult(() => this.repository.applyArchive(programId, command));
  }
}
