/** @format */

import { inject, Injectable } from "@angular/core";
import { InviteRepositoryPort } from "../../../domain/invite/ports/invite.repository.port";
import { catchError, map, Observable, of } from "rxjs";
import { fail, ok, Result } from "../../../domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class RevokeInviteUseCase {
  private readonly inviteRepositoryPort = inject(InviteRepositoryPort);

  execute(
    invitationId: number
  ): Observable<Result<void, { kind: "revoke_invite_error"; cause?: unknown }>> {
    return this.inviteRepositoryPort.revokeInvite(invitationId).pipe(
      map(() => ok<void>(undefined)),
      catchError(error => of(fail({ kind: "revoke_invite_error" as const, cause: error })))
    );
  }
}
