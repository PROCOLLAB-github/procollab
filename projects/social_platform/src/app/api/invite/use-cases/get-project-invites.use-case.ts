/** @format */

import { inject, Injectable } from "@angular/core";
import { InviteRepositoryPort } from "@domain/invite/ports/invite.repository.port";
import { catchError, map, Observable, of } from "rxjs";
import { fail, ok, Result } from "@domain/shared/result.type";
import { Invite } from "@domain/invite/invite.model";

@Injectable({ providedIn: "root" })
export class GetProjectInvitesUseCase {
  private readonly InviteRepositoryPort = inject(InviteRepositoryPort);

  execute(
    projectId: number
  ): Observable<Result<Invite[], { kind: "get_project_invites_error"; cause?: unknown }>> {
    return this.InviteRepositoryPort.getByProject(projectId).pipe(
      map(invites => ok<Invite[]>(invites)),
      catchError(error => of(fail({ kind: "get_project_invites_error" as const, cause: error })))
    );
  }
}
