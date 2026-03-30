/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { ProgramRepositoryPort } from "@domain/program/ports/program.repository.port";
import { fail, ok, Result } from "@domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class ApplyProjectToProgramUseCase {
  private readonly programRepositoryPort = inject(ProgramRepositoryPort);

  execute(
    programId: number,
    body: any
  ): Observable<Result<any, { kind: "apply_project_to_program_error"; cause?: unknown }>> {
    return this.programRepositoryPort.applyProjectToProgram(programId, body).pipe(
      map(result => ok<any>(result)),
      catchError(error =>
        of(fail({ kind: "apply_project_to_program_error" as const, cause: error }))
      )
    );
  }
}
