/** @format */

import { inject, Injectable } from "@angular/core";
import { ProjectResourceRepositoryPort } from "@domain/project/ports/project-resource.repository.port";
import { catchError, map, Observable, of } from "rxjs";
import { fail, ok, Result } from "@domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class DeleteResourceUseCase {
  private readonly projectResourceRepositoryPort = inject(ProjectResourceRepositoryPort);

  execute(projectId: number, resourceId: number): Observable<Result<void, { kind: "unknown" }>> {
    return this.projectResourceRepositoryPort.deleteResource(projectId, resourceId).pipe(
      map(() => ok<void>(undefined)),
      catchError(() => of(fail({ kind: "unknown" as const })))
    );
  }
}
