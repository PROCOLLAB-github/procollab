/** @format */

import { inject, Injectable } from "@angular/core";
import { InviteRepositoryPort } from "@domain/invite/ports/invite.repository.port";
import { catchError, map, Observable, of, tap } from "rxjs";
import { fail, ok, Result } from "@domain/shared/result.type";
import { EventBus } from "@domain/shared/event-bus";
import { revokeInvite } from "@domain/invite/events/revoke-invite.event";

@Injectable({ providedIn: "root" })
export class RevokeInviteUseCase {
  private readonly inviteRepositoryPort = inject(InviteRepositoryPort);
  private readonly eventBus = inject(EventBus);

  execute(
    invitationId: number
  ): Observable<Result<void, { kind: "revoke_invite_error"; cause?: unknown }>> {
    return this.inviteRepositoryPort.revokeInvite(invitationId).pipe(
      tap(invite => this.eventBus.emit(revokeInvite(invite.id, invite.project.id, invite.user.id))),
      map(() => ok<void>(undefined)),
      catchError(error => of(fail({ kind: "revoke_invite_error" as const, cause: error })))
    );
  }
}
