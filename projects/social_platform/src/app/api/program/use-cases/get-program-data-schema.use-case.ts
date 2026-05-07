/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { ProgramRepositoryPort } from "@domain/program/ports/program.repository.port";
import { ProgramDataSchema } from "@domain/program/program.model";
import { fail, ok, Result } from "@domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class GetProgramDataSchemaUseCase {
  private readonly programRepositoryPort = inject(ProgramRepositoryPort);

  execute(
    programId: number
  ): Observable<
    Result<ProgramDataSchema, { kind: "get_program_data_schema_error"; cause?: unknown }>
  > {
    return this.programRepositoryPort.getDataSchema(programId).pipe(
      map(schema => ok<ProgramDataSchema>(schema)),
      catchError(error =>
        of(fail({ kind: "get_program_data_schema_error" as const, cause: error }))
      )
    );
  }
}
