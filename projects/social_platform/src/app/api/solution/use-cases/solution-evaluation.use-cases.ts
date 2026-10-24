/** @format */

import { inject, Injectable } from "@angular/core";
import {
  SolutionRepositoryPort,
  SolutionRatingQuery,
  SolutionResultsQuery,
} from "@domain/solution/ports/solution.repository.port";
import {
  RateSolutionCommand,
  SolutionAssignmentsWrite,
  SolutionAllocationWrite,
  SolutionQuotaWrite,
} from "@domain/solution/solution-contract.model";
import { solutionRequestResult } from "./solution.use-cases";

@Injectable({ providedIn: "root" })
export class PreviewSolutionAllocationUseCase {
  private readonly repository = inject(SolutionRepositoryPort);
  execute(programId: number, command: SolutionAllocationWrite) {
    return solutionRequestResult(() => this.repository.previewAllocation(programId, command));
  }
}
@Injectable({ providedIn: "root" })
export class ApplySolutionAllocationUseCase {
  private readonly repository = inject(SolutionRepositoryPort);
  execute(programId: number, planToken: string) {
    return solutionRequestResult(() => this.repository.applyAllocation(programId, planToken));
  }
}
@Injectable({ providedIn: "root" })
export class PreviewSolutionQuotaUseCase {
  private readonly repository = inject(SolutionRepositoryPort);
  execute(programId: number, requiredEvaluators: number) {
    return solutionRequestResult(() => this.repository.previewQuota(programId, requiredEvaluators));
  }
}
@Injectable({ providedIn: "root" })
export class SaveSolutionQuotaUseCase {
  private readonly repository = inject(SolutionRepositoryPort);
  execute(programId: number, command: SolutionQuotaWrite) {
    return solutionRequestResult(() => this.repository.saveQuota(programId, command));
  }
}
@Injectable({ providedIn: "root" })
export class GetSolutionResultsUseCase {
  private readonly repository = inject(SolutionRepositoryPort);
  execute(programId: number, query?: SolutionResultsQuery) {
    return solutionRequestResult(() => this.repository.results(programId, query));
  }
}

@Injectable({ providedIn: "root" })
export class GetSolutionRatingsUseCase {
  private readonly repository = inject(SolutionRepositoryPort);
  execute(programId: number, query?: SolutionRatingQuery) {
    return solutionRequestResult(() => this.repository.ratings(programId, query));
  }
}

@Injectable({ providedIn: "root" })
export class GetSolutionRatingUseCase {
  private readonly repository = inject(SolutionRepositoryPort);
  execute(programId: number, solutionId: number) {
    return solutionRequestResult(() => this.repository.rating(programId, solutionId));
  }
}

@Injectable({ providedIn: "root" })
export class RateSolutionUseCase {
  private readonly repository = inject(SolutionRepositoryPort);
  execute(programId: number, solutionId: number, command: RateSolutionCommand) {
    return solutionRequestResult(() => this.repository.rate(programId, solutionId, command));
  }
}

@Injectable({ providedIn: "root" })
export class GetSolutionExpertAssignmentsUseCase {
  private readonly repository = inject(SolutionRepositoryPort);
  execute(programId: number, expertId: number) {
    return solutionRequestResult(() => this.repository.expertAssignments(programId, expertId));
  }
}

@Injectable({ providedIn: "root" })
export class SaveSolutionExpertAssignmentsUseCase {
  private readonly repository = inject(SolutionRepositoryPort);
  execute(programId: number, expertId: number, command: SolutionAssignmentsWrite) {
    return solutionRequestResult(() =>
      this.repository.saveExpertAssignments(programId, expertId, command),
    );
  }
}
