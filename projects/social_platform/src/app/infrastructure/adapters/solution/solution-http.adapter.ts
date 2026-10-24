/** @format */

import { inject, Injectable } from "@angular/core";
import { HttpParams } from "@angular/common/http";
import { ApiService } from "@corelib";
import {
  CreateSolutionCommand,
  ProgramSolution,
  SolutionContext,
  SolutionPage,
} from "@domain/solution/solution-contract.model";
import {
  SolutionListQuery,
  validSolutionId,
} from "@domain/solution/ports/solution.repository.port";

@Injectable({ providedIn: "root" })
export class SolutionHttpAdapter {
  private readonly api = inject(ApiService);

  private path(programId: number): string {
    if (!validSolutionId(programId)) throw new RangeError("Invalid program ID");
    return `/programs/${programId}/solutions/`;
  }

  context(programId: number) {
    this.path(programId);
    return this.api.get<SolutionContext>(`/programs/${programId}/solution-context/`);
  }

  create(programId: number, command: CreateSolutionCommand) {
    return this.api.post<ProgramSolution>(this.path(programId), command);
  }

  get(programId: number, solutionId: number) {
    if (!validSolutionId(solutionId)) throw new RangeError("Invalid solution ID");
    return this.api.get<ProgramSolution>(`${this.path(programId)}${solutionId}/`);
  }

  list(programId: number, query: SolutionListQuery = {}) {
    let params = new HttpParams();
    // Query string не проходит через CamelcaseInterceptor; имена уже из C00.
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) params = params.set(key, value);
    }
    return this.api.get<SolutionPage>(this.path(programId), params);
  }
}
