/** @format */

import { inject, Injectable } from "@angular/core";
import {
  SolutionRepositoryPort,
  SolutionManagerAssignmentQuery,
  SolutionManagerSolutionsQuery,
  SolutionAnalyticsExportQuery,
} from "@domain/solution/ports/solution.repository.port";
import { solutionRequestResult } from "./solution.use-cases";
import { solutionFileRequestResult } from "./solution-results-export.use-case";
import { SolutionReminderPreviewRequest } from "@domain/solution/solution-contract.model";

@Injectable({ providedIn: "root" })
export class PreviewSolutionExpertReminderUseCase {
  private readonly repository = inject(SolutionRepositoryPort);
  execute(programId: number, command: SolutionReminderPreviewRequest) {
    return solutionRequestResult(() => this.repository.previewExpertReminder(programId, command));
  }
}
@Injectable({ providedIn: "root" })
export class ConfirmSolutionExpertReminderUseCase {
  private readonly repository = inject(SolutionRepositoryPort);
  execute(programId: number, token: string) {
    return solutionRequestResult(() => this.repository.confirmExpertReminder(programId, token));
  }
}

@Injectable({ providedIn: "root" })
export class GetSolutionManagerAnalyticsUseCase {
  private readonly repository = inject(SolutionRepositoryPort);
  execute(programId: number) {
    return solutionRequestResult(() => this.repository.managerAnalytics(programId));
  }
}
@Injectable({ providedIn: "root" })
export class GetSolutionManagerAssignmentsUseCase {
  private readonly repository = inject(SolutionRepositoryPort);
  execute(programId: number, query?: SolutionManagerAssignmentQuery) {
    return solutionRequestResult(() => this.repository.managerAssignments(programId, query));
  }
}
@Injectable({ providedIn: "root" })
export class GetSolutionManagerAssignmentUseCase {
  private readonly repository = inject(SolutionRepositoryPort);
  execute(programId: number, assignmentId: number) {
    return solutionRequestResult(() => this.repository.managerAssignment(programId, assignmentId));
  }
}
@Injectable({ providedIn: "root" })
export class GetSolutionManagerSolutionsUseCase {
  private readonly repository = inject(SolutionRepositoryPort);
  execute(programId: number, query?: SolutionManagerSolutionsQuery) {
    return solutionRequestResult(() => this.repository.managerSolutions(programId, query));
  }
}
@Injectable({ providedIn: "root" })
export class ExportSolutionAnalyticsUseCase {
  private readonly repository = inject(SolutionRepositoryPort);
  execute(programId: number, query?: SolutionAnalyticsExportQuery) {
    return solutionFileRequestResult(() => this.repository.exportAnalytics(programId, query));
  }
}
