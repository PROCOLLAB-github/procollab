/** @format */

import { inject, Injectable } from "@angular/core";
import { ProjectRepositoryPort } from "../../../domain/project/ports/project.repository.port";
import { catchError, map, Observable, of } from "rxjs";
import { fail, ok, Result } from "../../../domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class DeleteProjectUseCase {
  private readonly projectRepositoryPort = inject(ProjectRepositoryPort);

  execute(id: number): Observable<Result<void, { kind: "unknown"; cause?: unknown }>> {
    return this.projectRepositoryPort.deleteOne(id).pipe(
      map(() => ok<void>(undefined)),
      catchError(error => of(fail({ kind: "unknown" as const, cause: error })))
    );
  }
}
