/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { ProgramRepositoryPort } from "@domain/program/ports/program.repository.port";
import { fail, ok, Result } from "@domain/shared/result.type";

/** Подтверждает приветствие конкретной программы для текущего участника. */
@Injectable({ providedIn: "root" })
export class AcknowledgeProgramWelcomeUseCase {
  private readonly programRepository = inject(ProgramRepositoryPort);

  execute(
    programId: number,
  ): Observable<
    Result<{ welcomeAcknowledgedAt: string }, { kind: "acknowledge_program_welcome_error" }>
  > {
    return this.programRepository.acknowledgeWelcome(programId).pipe(
      map(response => ok(response)),
      catchError(() => of(fail({ kind: "acknowledge_program_welcome_error" as const }))),
    );
  }
}
