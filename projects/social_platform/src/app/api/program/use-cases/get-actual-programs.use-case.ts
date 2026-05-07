/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { ProgramRepositoryPort } from "@domain/program/ports/program.repository.port";
import { Program } from "@domain/program/program.model";
import { fail, ok, Result } from "@domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class GetActualProgramsUseCase {
  private readonly programRepositoryPort = inject(ProgramRepositoryPort);

  execute(): Observable<
    Result<ApiPagination<Program>, { kind: "get_actual_programs_error"; cause?: unknown }>
  > {
    return this.programRepositoryPort.getActualPrograms().pipe(
      map(programs => ok<ApiPagination<Program>>(programs)),
      catchError(error => of(fail({ kind: "get_actual_programs_error" as const, cause: error })))
    );
  }
}
