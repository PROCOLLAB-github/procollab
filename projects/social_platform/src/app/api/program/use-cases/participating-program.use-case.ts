/** @format */

import { inject, Injectable } from "@angular/core";
import { ProgramRepositoryPort } from "@domain/program/ports/program.repository.port";
import { catchError, map, Observable, of } from "rxjs";
import { fail, ok, Result } from "@domain/shared/result.type";
import { HttpParams } from "@angular/common/http";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { Program } from "@domain/program/program.model";

/** Страница программ с необязательными фильтрами; ошибка → `unknown`. */
@Injectable({ providedIn: "root" })
export class ParticipatingProgramUseCase {
  private readonly programRepositoryPort = inject(ProgramRepositoryPort);

  execute(
    filter?: HttpParams,
    offset = 0,
    limit = 20,
  ): Observable<Result<ApiPagination<Program>, { kind: "unknown" }>> {
    return this.programRepositoryPort.getAll(offset, limit, filter).pipe(
      map(response => ok<ApiPagination<Program>>(response)),
      catchError(() => of(fail({ kind: "unknown" as const }))),
    );
  }
}
