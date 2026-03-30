/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { ProgramRepositoryPort } from "@domain/program/ports/program.repository.port";
import { Program } from "@domain/program/program.model";
import { fail, ok, Result } from "@domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class GetProgramsUseCase {
  private readonly programRepositoryPort = inject(ProgramRepositoryPort);

  execute(
    skip: number,
    take: number
  ): Observable<Result<ApiPagination<Program>, { kind: "get_programs_error"; cause?: unknown }>> {
    return this.programRepositoryPort.getAll(skip, take).pipe(
      map(programs => ok<ApiPagination<Program>>(programs)),
      catchError(error => of(fail({ kind: "get_programs_error" as const, cause: error })))
    );
  }
}
