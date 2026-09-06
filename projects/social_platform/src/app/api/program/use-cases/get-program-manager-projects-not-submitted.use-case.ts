/** @format */
import { inject, Injectable } from "@angular/core";
import { HttpErrorResponse } from "@angular/common/http";
import { ProgramRepositoryPort } from "@domain/program/ports/program.repository.port";
import {
  ProgramAnalyticsNotSubmittedProjectsPage,
  ProgramAnalyticsAttentionQuery,
} from "@domain/program/program-analytics-attention.model";
import { ProgramAnalyticsError } from "@domain/program/program-analytics.model";
import { fail, ok, Result } from "@domain/shared/result.type";
import { catchError, map, Observable, of } from "rxjs";

/** Read-only страница несданных проектов; применимость и сроки определяет backend. */
@Injectable({ providedIn: "root" })
export class GetProgramManagerProjectsNotSubmittedUseCase {
  private readonly repository = inject(ProgramRepositoryPort);

  /** Сохраняет серверные данные и отдаёт контролируемую ошибку без сырого HTTP body. */
  execute(
    programId: number,
    query: ProgramAnalyticsAttentionQuery,
  ): Observable<Result<ProgramAnalyticsNotSubmittedProjectsPage, ProgramAnalyticsError>> {
    return this.repository.getManagerProjectsNotSubmitted(programId, query).pipe(
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
