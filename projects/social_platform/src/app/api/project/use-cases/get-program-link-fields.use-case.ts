/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { ProjectProgramRepositoryPort } from "@domain/project/ports/project-program.repository.port";
import {
  ProgramLinkFields,
  ProgramLinkFieldsError,
} from "@domain/project/program-link-fields.model";
import { fail, ok, Result } from "@domain/shared/result.type";
import { mapProgramLinkFieldsError } from "../program-link-fields-error";

@Injectable({ providedIn: "root" })
export class GetProgramLinkFieldsUseCase {
  private readonly repository = inject(ProjectProgramRepositoryPort);

  execute(programLinkId: number): Observable<Result<ProgramLinkFields, ProgramLinkFieldsError>> {
    return this.repository.getProgramLinkFields(programLinkId).pipe(
      map(snapshot => ok(snapshot)),
      catchError(error => of(fail(mapProgramLinkFieldsError(error)))),
    );
  }
}
