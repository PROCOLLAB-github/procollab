/** @format */

import { EventBus } from "@domain/shared/event-bus";

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of, tap } from "rxjs";
import { ProjectProgramRepositoryPort } from "@domain/project/ports/project-program.repository.port";
import { ProjectNewAdditionalProgramFields } from "@domain/program/partner-program-fields.model";
import { ProgramLinkFieldsError } from "@domain/project/program-link-fields.model";
import { mapProgramLinkFieldsError } from "../program-link-fields-error";
import { fail, ok, Result } from "@domain/shared/result.type";

/** Обновляет дополнительные значения строго одной связи проекта и программы. */
@Injectable({ providedIn: "root" })
export class UpdateProgramLinkFieldsUseCase {
  private readonly events = inject(EventBus);
  private readonly projectProgramRepositoryPort = inject(ProjectProgramRepositoryPort);

  execute(
    programLinkId: number,
    newValues: ProjectNewAdditionalProgramFields[],
  ): Observable<Result<void, ProgramLinkFieldsError>> {
    return this.projectProgramRepositoryPort.updateProgramLinkFields(programLinkId, newValues).pipe(
      tap(() =>
        this.events.emit({ type: "ProgramWidgetChanged", payload: {}, occurredAt: new Date() }),
      ),
      map(() => ok(undefined)),
      catchError(error => of(fail(mapProgramLinkFieldsError(error)))),
    );
  }
}
