/** @format */

import { inject, Injectable } from "@angular/core";
import { ProgramRepositoryPort } from "@domain/program/ports/program.repository.port";
import { catchError, map, Observable, of } from "rxjs";
import { fail, ok, Result } from "@domain/shared/result.type";
import { HttpParams } from "@angular/common/http";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { Project } from "@domain/project/project.model";

@Injectable({ providedIn: "root" })
export class CreateProgramFiltersUseCase {
  private readonly programRepositoryPort = inject(ProgramRepositoryPort);

  execute(
    programId: number,
    filters: Record<string, string[]>,
    params?: HttpParams
  ): Observable<Result<ApiPagination<Project>, { kind: "unknown" }>> {
    return this.programRepositoryPort.createProgramFilters(programId, filters, params).pipe(
      map(project => ok<ApiPagination<Project>>(project)),
      catchError(() => of(fail({ kind: "unknown" as const })))
    );
  }
}
