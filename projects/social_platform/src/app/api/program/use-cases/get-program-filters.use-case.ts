/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { ProgramRepositoryPort } from "@domain/program/ports/program.repository.port";
import { PartnerProgramFields } from "@domain/program/partner-program-fields.model";
import { fail, ok, Result } from "@domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class GetProgramFiltersUseCase {
  private readonly programRepositoryPort = inject(ProgramRepositoryPort);

  execute(
    programId: number
  ): Observable<
    Result<PartnerProgramFields[], { kind: "get_program_filters_error"; cause?: unknown }>
  > {
    return this.programRepositoryPort.getProgramFilters(programId).pipe(
      map(result => ok<PartnerProgramFields[]>(result)),
      catchError(error => of(fail({ kind: "get_program_filters_error" as const, cause: error })))
    );
  }
}
