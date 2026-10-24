/** @format */

import { inject, Injectable } from "@angular/core";
import {
  SolutionRepositoryPort,
  SolutionListQuery,
} from "@domain/solution/ports/solution.repository.port";
import { CreateSolutionCommand } from "@domain/solution/solution-contract.model";
import { SolutionHttpAdapter } from "../../adapters/solution/solution-http.adapter";

@Injectable({ providedIn: "root" })
export class SolutionRepository implements SolutionRepositoryPort {
  private readonly http = inject(SolutionHttpAdapter);
  context(programId: number) {
    return this.http.context(programId);
  }
  create(programId: number, command: CreateSolutionCommand) {
    return this.http.create(programId, command);
  }
  get(programId: number, solutionId: number) {
    return this.http.get(programId, solutionId);
  }
  list(programId: number, query?: SolutionListQuery) {
    return this.http.list(programId, query);
  }
}
