/** @format */

import { inject, Injectable } from "@angular/core";
import { ProgramRepositoryPort } from "../../../domain/program/ports/program.repository.port";
import { HttpParams } from "@angular/common/http";
import { catchError, map, Observable, of } from "rxjs";
import { fail, ok, Result } from "../../../domain/shared/result.type";
import { ApiPagination } from "../../../domain/other/api-pagination.model";
import { Project } from "../../../domain/project/project.model";

@Injectable({ providedIn: "root" })
export class GetAllProjectsUseCase {
  private readonly programRepositoryPort = inject(ProgramRepositoryPort);

  execute(
    programId: number,
    params?: HttpParams
  ): Observable<Result<ApiPagination<Project>, { kind: "unknown" }>> {
    return this.programRepositoryPort.getAllProjects(programId, params).pipe(
      map(project => ok<ApiPagination<Project>>(project)),
      catchError(() => of(fail({ kind: "unknown" as const })))
    );
  }
}
