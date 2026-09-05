/** @format */
import { inject, Injectable } from "@angular/core";
import { HttpErrorResponse } from "@angular/common/http";
import { ProgramRepositoryPort } from "@domain/program/ports/program.repository.port";
import {
  ProgramAnalyticsAssignmentScoreDetail,
  ProgramAnalyticsError,
} from "@domain/program/program-analytics.model";
import { fail, ok, Result } from "@domain/shared/result.type";
import { catchError, map, Observable, of } from "rxjs";

/** Manager-only detail: принадлежность назначения программе проверяет backend. */
@Injectable({ providedIn: "root" })
export class GetProgramManagerAssignmentScoresUseCase {
  private readonly repository = inject(ProgramRepositoryPort);

  execute(
    programId: number,
    assignmentId: number,
  ): Observable<Result<ProgramAnalyticsAssignmentScoreDetail, ProgramAnalyticsError>> {
    return this.repository.getManagerAssignmentScores(programId, assignmentId).pipe(
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
