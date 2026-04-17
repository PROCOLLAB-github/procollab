/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { Resource, ResourceDto } from "@domain/project/resource.model";
import { ProjectResourceRepositoryPort } from "@domain/project/ports/project-resource.repository.port";
import { fail, ok, Result } from "@domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class UpdateResourceUseCase {
  private readonly projectResourceRepositoryPort = inject(ProjectResourceRepositoryPort);

  execute(
    projectId: number,
    resourceId: number,
    params: Omit<ResourceDto, "projectId">
  ): Observable<Result<Resource, { kind: "update_project_resource_error"; cause?: unknown }>> {
    return this.projectResourceRepositoryPort.updateResource(projectId, resourceId, params).pipe(
      map(resource => ok<Resource>(resource)),
      catchError(error =>
        of(fail({ kind: "update_project_resource_error" as const, cause: error }))
      )
    );
  }
}
