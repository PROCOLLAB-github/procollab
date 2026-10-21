/** @format */
import { inject, Injectable } from "@angular/core";
import { HttpErrorResponse } from "@angular/common/http";
import { ProgramRepositoryPort } from "@domain/program/ports/program.repository.port";
import {
  ProgramAttentionActionError,
  ProgramAttentionActionQuery,
  ProgramAttentionCategory,
} from "@domain/program/program-attention-actions.model";
import { fail, ok, Result } from "@domain/shared/result.type";
import { catchError, map, Observable, of } from "rxjs";

@Injectable({ providedIn: "root" })
export class ProgramAttentionActionsUseCase {
  private readonly repository = inject(ProgramRepositoryPort);

  preview(
    programId: number,
    category: ProgramAttentionCategory,
    query: ProgramAttentionActionQuery,
  ) {
    return this.safe(this.repository.previewAttentionReminder(programId, category, query));
  }

  send(programId: number, category: ProgramAttentionCategory, token: string) {
    return this.safe(this.repository.sendAttentionReminder(programId, category, token));
  }

  export(
    programId: number,
    category: ProgramAttentionCategory,
    query: ProgramAttentionActionQuery,
  ) {
    return this.safe(this.repository.exportAttention(programId, category, query));
  }

  private safe<T>(request: Observable<T>): Observable<Result<T, ProgramAttentionActionError>> {
    return request.pipe(
      map(value => ok(value)),
      catchError((error: unknown) => {
        const status = error instanceof HttpErrorResponse ? error.status : 0;
        const kind: ProgramAttentionActionError["kind"] =
          status === 401
            ? "unauthorized"
            : status === 403
              ? "forbidden"
              : status === 404
                ? "not_found"
                : status === 400
                  ? "validation"
                  : "network";
        return of(fail({ kind }));
      }),
    );
  }
}
