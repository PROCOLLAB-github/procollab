/** @format */

import { inject, Injectable } from "@angular/core";
import { ProjectResourceRepositoryPort } from "@domain/project/ports/project-resource.repository.port";
import { catchError, map, Observable, of } from "rxjs";
import { fail, ok, Result } from "@domain/shared/result.type";
import { Resource, ResourceDto } from "@domain/project/resource.model";

@Injectable({ providedIn: "root" })
export class CreateResourceUseCase {
  private readonly projectResourceRepositoryPort = inject(ProjectResourceRepositoryPort);

  execute(
    projectId: number,
    params: Omit<ResourceDto, "projectId">
  ): Observable<Result<Resource, { kind: "create_project_resource_error"; cause?: unknown }>> {
    return this.projectResourceRepositoryPort.createResource(projectId, params).pipe(
      map(resource => ok<Resource>(resource)),
      catchError(error =>
        of(fail({ kind: "create_project_resource_error" as const, cause: error }))
      )
    );
  }
}
