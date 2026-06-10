/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { ProgramRepositoryPort } from "@domain/program/ports/program.repository.port";
import { ProjectAdditionalFields } from "@domain/project/project-additional-fields.model";
import { fail, ok, Result } from "@domain/shared/result.type";

/** Сценарий: поля заявки проекта на программу (`/programs/{id}/projects/apply/`); ошибка → `get_program_project_additional_fields_error`. */
@Injectable({ providedIn: "root" })
export class GetProgramProjectAdditionalFieldsUseCase {
  private readonly programRepositoryPort = inject(ProgramRepositoryPort);

  execute(
    programId: number,
  ): Observable<
    Result<
      ProjectAdditionalFields,
      { kind: "get_program_project_additional_fields_error"; cause?: unknown }
    >
  > {
    return this.programRepositoryPort.getProgramProjectAdditionalFields(programId).pipe(
      map(result => ok<ProjectAdditionalFields>(result)),
      catchError(error =>
        of(
          fail({
            kind: "get_program_project_additional_fields_error" as const,
            cause: error,
          }),
        ),
      ),
    );
  }
}
