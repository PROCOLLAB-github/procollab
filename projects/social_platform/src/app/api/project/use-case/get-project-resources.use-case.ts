/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { ProjectResourceRepositoryPort } from "../../../domain/project/ports/project-resource.repository.port";
import { Resource } from "../../../domain/project/resource.model";
import { fail, ok, Result } from "../../../domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class GetProjectResourcesUseCase {
  private readonly projectResourceRepositoryPort = inject(ProjectResourceRepositoryPort);

  execute(
    projectId: number
  ): Observable<Result<Resource[], { kind: "get_project_resources_error"; cause?: unknown }>> {
    return this.projectResourceRepositoryPort.fetchAll(projectId).pipe(
      map(resources => ok<Resource[]>(resources)),
      catchError(error => of(fail({ kind: "get_project_resources_error" as const, cause: error })))
    );
  }
}
