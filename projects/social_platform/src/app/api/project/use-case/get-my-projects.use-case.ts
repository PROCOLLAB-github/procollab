/** @format */

import { inject, Injectable } from "@angular/core";
import { HttpParams } from "@angular/common/http";
import { catchError, map, Observable, of } from "rxjs";
import { Project } from "../../../domain/project/project.model";
import { ApiPagination } from "../../../domain/other/api-pagination.model";
import { ProjectRepositoryPort } from "../../../domain/project/ports/project.repository.port";
import { fail, ok, Result } from "../../../domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class GetMyProjectsUseCase {
  private readonly projectRepositoryPort = inject(ProjectRepositoryPort);

  execute(params?: HttpParams): Observable<Result<ApiPagination<Project>, { kind: "unknown" }>> {
    return this.projectRepositoryPort.getMy(params).pipe(
      map(projects => ok<ApiPagination<Project>>(projects)),
      catchError(() => of(fail({ kind: "unknown" as const })))
    );
  }
}
