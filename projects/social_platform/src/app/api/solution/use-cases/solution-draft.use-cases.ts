/** @format */

import { inject, Injectable } from "@angular/core";
import { SolutionRepositoryPort } from "@domain/solution/ports/solution.repository.port";
import {
  UpdateSolutionCommand,
  SubmitSolutionCommand,
} from "@domain/solution/solution-contract.model";
import { solutionRequestResult } from "./solution.use-cases";

@Injectable({ providedIn: "root" })
export class SubmitSolutionUseCase {
  private readonly repository = inject(SolutionRepositoryPort);
  execute(programId: number, solutionId: number, command: SubmitSolutionCommand) {
    return solutionRequestResult(() => this.repository.submit(programId, solutionId, command));
  }
}

@Injectable({ providedIn: "root" })
export class UpdateSolutionUseCase {
  private readonly repository = inject(SolutionRepositoryPort);
  execute(programId: number, solutionId: number, command: UpdateSolutionCommand) {
    return solutionRequestResult(() => this.repository.update(programId, solutionId, command));
  }
}
@Injectable({ providedIn: "root" })
export class UploadSolutionFileUseCase {
  private readonly repository = inject(SolutionRepositoryPort);
  execute(file: File) {
    return solutionRequestResult(() => this.repository.upload(file));
  }
}
