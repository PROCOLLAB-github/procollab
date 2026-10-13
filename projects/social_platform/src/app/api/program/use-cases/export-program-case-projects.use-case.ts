/** @format */
import { inject, Injectable } from "@angular/core";
import { ProgramRepositoryPort } from "@domain/program/ports/program.repository.port";
import {
  ProgramCaseError,
  ProgramCaseFilters,
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

  /** Проверяет тот же отбор перед XLSX; файл содержит все совпадения без пагинации. */
  execute(
    programId: number,
    selection: ProgramCaseSelection,
    filters: ProgramCaseFilters = {},
  ): Observable<Result<Blob, ProgramCaseError>> {
    return this.getProjects.execute(programId, { selection, ...filters, limit: 1, offset: 0 }).pipe(
      switchMap(result =>
        result.ok
          ? this.repository
              .exportCaseProjects(programId, selection, filters)
              .pipe(map(blob => ok(blob)))
          : of(fail(result.error)),
      ),
      catchError((error: unknown) => of(fail(caseRequestError(error)))),
    );
  }
}
