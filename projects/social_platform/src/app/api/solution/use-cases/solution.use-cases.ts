/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, defer, map, Observable, of } from "rxjs";
import { SolutionRepositoryPort } from "@domain/solution/ports/solution.repository.port";
import { CreateSolutionCommand } from "@domain/solution/solution-contract.model";
import { fail, ok } from "@domain/shared/result.type";
import { solutionError } from "../solution-error";

export function solutionRequestResult<T>(request: () => Observable<T>) {
  return defer(request).pipe(
    map(value => ok(value)),
    catchError(error => of(fail(solutionError(error)))),
  );
}

@Injectable({ providedIn: "root" })
export class GetSolutionContextUseCase {
  private readonly repository = inject(SolutionRepositoryPort);
  execute(programId: number) {
    return solutionRequestResult(() => this.repository.context(programId));
  }
}

@Injectable({ providedIn: "root" })
export class CreateSolutionUseCase {
  private readonly repository = inject(SolutionRepositoryPort);
  execute(programId: number, command: CreateSolutionCommand = {}) {
    return solutionRequestResult(() => this.repository.create(programId, command));
  }
}

@Injectable({ providedIn: "root" })
export class GetSolutionUseCase {
  private readonly repository = inject(SolutionRepositoryPort);
  execute(programId: number, solutionId: number) {
    return solutionRequestResult(() => this.repository.get(programId, solutionId));
  }
}
