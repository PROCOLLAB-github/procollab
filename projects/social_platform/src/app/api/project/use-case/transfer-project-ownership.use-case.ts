/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { ProjectCollaboratorsRepositoryPort } from "../../../domain/project/ports/project-collaborators.repository.port";
import { fail, ok, Result } from "../../../domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class TransferProjectOwnershipUseCase {
  private readonly projectCollaboratorsRepositoryPort = inject(ProjectCollaboratorsRepositoryPort);

  execute(
    projectId: number,
    userId: number
  ): Observable<Result<number, { kind: "transfer_project_ownership_error"; cause?: unknown }>> {
    return this.projectCollaboratorsRepositoryPort.patchSwitchLeader(projectId, userId).pipe(
      map(() => ok<number>(userId)),
      catchError(error =>
        of(fail({ kind: "transfer_project_ownership_error" as const, cause: error }))
      )
    );
  }
}
