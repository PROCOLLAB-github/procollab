/** @format */
import { inject, Injectable } from "@angular/core";
import { HttpErrorResponse } from "@angular/common/http";
import { ProgramRepositoryPort } from "@domain/program/ports/program.repository.port";
import {
  ProgramAnalyticsAttentionProjects,
  ProgramAnalyticsAttentionQuery,
} from "@domain/program/program-analytics-attention.model";
import { ProgramAnalyticsError } from "@domain/program/program-analytics.model";
import { fail, ok, Result } from "@domain/shared/result.type";
import { catchError, map, Observable, of } from "rxjs";

/** Страница сданных работ, ожидающих оценивания; режим и причины задаёт backend. */
@Injectable({ providedIn: "root" })
export class GetProgramManagerProjectsAwaitingEvaluationUseCase {
  private readonly repository = inject(ProgramRepositoryPort);

  /** Передаёт поиск/страницу и возвращает только безопасную категорию ошибки, не HTTP body. */
  execute(
    programId: number,
    query: ProgramAnalyticsAttentionQuery,
  ): Observable<Result<ProgramAnalyticsAttentionProjects, ProgramAnalyticsError>> {
    return this.repository.getManagerProjectsAwaitingEvaluation(programId, query).pipe(
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
