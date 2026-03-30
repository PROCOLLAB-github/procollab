/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { ProgramRepositoryPort } from "@domain/program/ports/program.repository.port";
import { Program } from "@domain/program/program.model";
import { fail, ok, Result } from "@domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class GetProgramUseCase {
  private readonly programRepositoryPort = inject(ProgramRepositoryPort);

  execute(
    programId: number
  ): Observable<Result<Program, { kind: "get_program_error"; cause?: unknown }>> {
    return this.programRepositoryPort.getOne(programId).pipe(
      map(program => ok<Program>(program)),
      catchError(error => of(fail({ kind: "get_program_error" as const, cause: error })))
    );
  }
}
