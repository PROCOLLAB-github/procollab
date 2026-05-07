/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { Project } from "@domain/project/project.model";
import { ProjectRepositoryPort } from "@domain/project/ports/project.repository.port";
import { fail, ok, Result } from "@domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class GetProjectUseCase {
  private readonly projectRepositoryPort = inject(ProjectRepositoryPort);

  execute(id: number): Observable<Result<Project, { kind: "get_project_error"; cause?: unknown }>> {
    return this.projectRepositoryPort.getOne(id).pipe(
      map(project => ok<Project>(project)),
      catchError(error => of(fail({ kind: "get_project_error" as const, cause: error })))
    );
  }
}
