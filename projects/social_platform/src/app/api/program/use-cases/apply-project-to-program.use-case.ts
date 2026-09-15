/** @format */

import { EventBus } from "@domain/shared/event-bus";

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of, tap } from "rxjs";
import { ProgramRepositoryPort } from "@domain/program/ports/program.repository.port";
import { fail, ok, Result } from "@domain/shared/result.type";
import { ApplyToProgramDTO } from "@domain/program/dto/apply-to-program.model";

/** Сценарий: подать проект в программу; ошибка → `apply_project_to_program_error`. */
@Injectable({ providedIn: "root" })
export class ApplyProjectToProgramUseCase {
  private readonly events = inject(EventBus);
  private readonly programRepositoryPort = inject(ProgramRepositoryPort);

  execute(
    programId: number,
    dto: ApplyToProgramDTO,
  ): Observable<Result<any, { kind: "apply_project_to_program_error"; cause?: unknown }>> {
    return this.programRepositoryPort.applyProjectToProgram(programId, dto).pipe(
      tap(() =>
        this.events.emit({ type: "ProgramWidgetChanged", payload: {}, occurredAt: new Date() }),
      ),
      map(result => ok<any>(result)),
      catchError(error =>
        of(fail({ kind: "apply_project_to_program_error" as const, cause: error })),
      ),
    );
  }
}
