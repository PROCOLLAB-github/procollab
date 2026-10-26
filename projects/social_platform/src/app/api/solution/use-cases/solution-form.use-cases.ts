/** @format */

import { inject, Injectable } from "@angular/core";
import { SolutionRepositoryPort } from "@domain/solution/ports/solution.repository.port";
import { SolutionFormWrite } from "@domain/solution/solution-contract.model";
import { solutionRequestResult } from "./solution.use-cases";

@Injectable({ providedIn: "root" })
export class GetSolutionFormUseCase {
  private readonly repository = inject(SolutionRepositoryPort);
  execute(programId: number) {
    return solutionRequestResult(() => this.repository.form(programId));
  }
}
@Injectable({ providedIn: "root" })
export class GetManagedSolutionFormUseCase {
  private readonly repository = inject(SolutionRepositoryPort);
  execute(programId: number) {
    return solutionRequestResult(() => this.repository.managedForm(programId));
  }
}
@Injectable({ providedIn: "root" })
export class SaveManagedSolutionFormUseCase {
  private readonly repository = inject(SolutionRepositoryPort);
  execute(programId: number, command: SolutionFormWrite) {
    return solutionRequestResult(() => this.repository.saveManagedForm(programId, command));
  }
}
@Injectable({ providedIn: "root" })
export class GetSolutionTemplatesUseCase {
  private readonly repository = inject(SolutionRepositoryPort);
  execute() {
    return solutionRequestResult(() => this.repository.templates());
  }
}
