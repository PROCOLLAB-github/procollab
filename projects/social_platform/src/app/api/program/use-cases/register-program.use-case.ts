/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { ProgramRepositoryPort } from "../../../domain/program/ports/program.repository.port";
import { ProgramDataSchema } from "../../../domain/program/program.model";
import { fail, ok, Result } from "../../../domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class RegisterProgramUseCase {
  private readonly programRepositoryPort = inject(ProgramRepositoryPort);

  execute(
    programId: number,
    additionalData: Record<string, string>
  ): Observable<Result<ProgramDataSchema, { kind: "register_program_error"; cause?: unknown }>> {
    return this.programRepositoryPort.register(programId, additionalData).pipe(
      map(result => ok<ProgramDataSchema>(result)),
      catchError(error => of(fail({ kind: "register_program_error" as const, cause: error })))
    );
  }
}
