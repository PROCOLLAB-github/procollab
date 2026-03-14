/** @format */

import { inject, Injectable } from "@angular/core";
import { ProjectRepositoryPort } from "../../../domain/project/ports/project.repository.port";
import { HttpParams } from "@angular/common/http";
import { catchError, map, Observable, of } from "rxjs";
import { fail, ok, Result } from "../../../domain/shared/result.type";
import { Project } from "../../../domain/project/project.model";
import { ApiPagination } from "../../../domain/other/api-pagination.model";

@Injectable({ providedIn: "root" })
export class GetAllProjectsUseCase {
  private readonly projectRepositoryPort = inject(ProjectRepositoryPort);

  execute(params?: HttpParams): Observable<Result<ApiPagination<Project>, { kind: "unknown" }>> {
    return this.projectRepositoryPort.getAll(params).pipe(
      map(projects => ok<ApiPagination<Project>>(projects)),
      catchError(() => of(fail({ kind: "unknown" as const })))
    );
  }
}
