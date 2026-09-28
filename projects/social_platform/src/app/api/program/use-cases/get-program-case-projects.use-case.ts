/** @format */
import { inject, Injectable } from "@angular/core";
import { HttpErrorResponse } from "@angular/common/http";
import { ProgramRepositoryPort } from "@domain/program/ports/program.repository.port";
import {
  isProgramCasePage,
  ProgramCaseError,
  ProgramCasePage,
  ProgramCaseQuery,
} from "@domain/program/program-case-analytics.model";
import { fail, ok, Result } from "@domain/shared/result.type";
import { catchError, map, Observable, of } from "rxjs";

export function caseRequestError(error: unknown): ProgramCaseError {
  const status = error instanceof HttpErrorResponse ? error.status : 0;
  return {
    kind:
      status === 401
        ? "unauthorized"
        : status === 403
          ? "forbidden"
          : status === 404
            ? "not_found"
            : status === 400
              ? "invalid"
              : "network",
  };
}

@Injectable({ providedIn: "root" })
export class GetProgramCaseProjectsUseCase {
  private readonly repository = inject(ProgramRepositoryPort);

  execute(
    programId: number,
    query: ProgramCaseQuery,
  ): Observable<Result<ProgramCasePage, ProgramCaseError>> {
    return this.repository.getCaseProjects(programId, query).pipe(
      map(value =>
        isProgramCasePage(value, query.selection)
          ? ok(value)
          : fail<ProgramCaseError>({ kind: "unsupported" }),
      ),
      catchError((error: unknown) => of(fail(caseRequestError(error)))),
    );
  }
}
