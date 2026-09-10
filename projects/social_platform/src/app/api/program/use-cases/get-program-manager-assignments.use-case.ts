/** @format */
import { inject, Injectable } from "@angular/core";
import { HttpErrorResponse } from "@angular/common/http";
import { ProgramRepositoryPort } from "@domain/program/ports/program.repository.port";
import {
  ProgramAnalyticsAssignment,
  ProgramAnalyticsAssignmentScope,
  ProgramAnalyticsError,
} from "@domain/program/program-analytics.model";
import { fail, ok, Result } from "@domain/shared/result.type";
import { catchError, map, Observable, of } from "rxjs";

/** Manager-only список: pending включает not_ready, pending и in_progress. */
@Injectable({ providedIn: "root" })
export class GetProgramManagerAssignmentsUseCase {
  private readonly repository = inject(ProgramRepositoryPort);

  execute(
    programId: number,
    scope: ProgramAnalyticsAssignmentScope,
  ): Observable<Result<ProgramAnalyticsAssignment[], ProgramAnalyticsError>> {
    return this.repository.getManagerAssignments(programId, scope).pipe(
      map(value => ok(value)),
      catchError((error: unknown) => {
        const status = error instanceof HttpErrorResponse ? error.status : 0;
        const kind: ProgramAnalyticsError["kind"] =
          status === 401
            ? "unauthorized"
            : status === 403
              ? "forbidden"
              : status === 404
                ? "not_found"
                : "network";
        return of(fail({ kind }));
      }),
    );
  }
}
