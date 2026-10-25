/** @format */
import { inject, Injectable } from "@angular/core";
import {
  SolutionRepositoryPort,
  SolutionHistoryQuery,
} from "@domain/solution/ports/solution.repository.port";
import {
  SolutionRegistrationRemovalPreviewRequest,
  SolutionRegistrationRemovalApplyRequest,
} from "@domain/solution/solution-contract.model";
import { solutionRequestResult } from "./solution.use-cases";

@Injectable({ providedIn: "root" })
export class PreviewSolutionRegistrationRemovalUseCase {
  private readonly repository = inject(SolutionRepositoryPort);
  execute(programId: number, command: SolutionRegistrationRemovalPreviewRequest) {
    return solutionRequestResult(() =>
      this.repository.previewRegistrationRemoval(programId, command),
    );
  }
}
@Injectable({ providedIn: "root" })
export class ApplySolutionRegistrationRemovalUseCase {
  private readonly repository = inject(SolutionRepositoryPort);
  execute(programId: number, command: SolutionRegistrationRemovalApplyRequest) {
    return solutionRequestResult(() =>
      this.repository.applyRegistrationRemoval(programId, command),
    );
  }
}
@Injectable({ providedIn: "root" })
export class ListSolutionRegistrationRemovalsUseCase {
  private readonly repository = inject(SolutionRepositoryPort);
  execute(programId: number, query?: SolutionHistoryQuery) {
    return solutionRequestResult(() => this.repository.listRegistrationRemovals(programId, query));
  }
}
@Injectable({ providedIn: "root" })
export class ReadSolutionRegistrationRemovalUseCase {
  private readonly repository = inject(SolutionRepositoryPort);
  execute(programId: number, auditId: number) {
    return solutionRequestResult(() => this.repository.readRegistrationRemoval(programId, auditId));
  }
}
