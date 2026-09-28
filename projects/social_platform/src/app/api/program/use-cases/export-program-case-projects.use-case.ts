/** @format */
import { inject, Injectable } from "@angular/core";
import { ProgramRepositoryPort } from "@domain/program/ports/program.repository.port";
import {
  ProgramCaseError,
  ProgramCaseSelection,
} from "@domain/program/program-case-analytics.model";
import { fail, ok, Result } from "@domain/shared/result.type";
import { catchError, map, Observable, of, switchMap } from "rxjs";
import {
  caseRequestError,
  GetProgramCaseProjectsUseCase,
} from "./get-program-case-projects.use-case";

@Injectable({ providedIn: "root" })
export class ExportProgramCaseProjectsUseCase {
  private readonly repository = inject(ProgramRepositoryPort);
  private readonly getProjects = inject(GetProgramCaseProjectsUseCase);

  /** Повторная проверка контракта перед файлом; search/offset/limit не попадают в export. */
  execute(
    programId: number,
    selection: ProgramCaseSelection,
  ): Observable<Result<Blob, ProgramCaseError>> {
    return this.getProjects.execute(programId, { selection, limit: 1, offset: 0 }).pipe(
      switchMap(result =>
        result.ok
          ? this.repository.exportCaseProjects(programId, selection).pipe(map(blob => ok(blob)))
          : of(fail(result.error)),
      ),
      catchError((error: unknown) => of(fail(caseRequestError(error)))),
    );
  }
}
