/** @format */

import { HttpErrorResponse } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { ProgramRepositoryPort } from "@domain/program/ports/program.repository.port";
import { ProgramRoleWidget, ProgramWidgetError } from "@domain/program/program-role-widget.model";
import { fail, ok, Result } from "@domain/shared/result.type";
import { catchError, map, Observable, of } from "rxjs";

/** Ошибки не содержат raw body и не превращаются в нулевые метрики. */
@Injectable({ providedIn: "root" })
export class GetProgramRoleWidgetUseCase {
  private readonly repository = inject(ProgramRepositoryPort);
  /** Загружает одну ролевую сводку; HTTP-ошибка сохраняется как состояние ошибки. */
  execute(programId: number): Observable<Result<ProgramRoleWidget, ProgramWidgetError>> {
    return this.repository.getRoleWidget(programId).pipe(
      map(data => ok(data)),
      catchError((error: unknown) => {
        const status = error instanceof HttpErrorResponse ? error.status : 0;
        const kind: ProgramWidgetError =
          status === 401
            ? "unauthorized"
            : status === 403
              ? "forbidden"
              : status === 404
                ? "not_found"
                : status === 409
                  ? "integrity"
                  : "network";
        return of(fail(kind));
      }),
    );
  }
}
