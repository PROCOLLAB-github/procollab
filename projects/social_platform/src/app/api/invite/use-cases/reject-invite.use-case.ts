/** @format */

import { inject, Injectable } from "@angular/core";
import { InviteRepositoryPort } from "../../../domain/invite/ports/invite.repository.port";
import { catchError, map, Observable, of, tap } from "rxjs";
import { fail, ok, Result } from "../../../domain/shared/result.type";
import { EventBus } from "../../../domain/shared/event-bus";
import { rejectInvite } from "../../../domain/invite/events/reject-invite.event";

@Injectable({ providedIn: "root" })
export class RejectInviteUseCase {
  private readonly inviteRepositoryPort = inject(InviteRepositoryPort);
  private readonly eventBus = inject(EventBus);

  execute(inviteId: number): Observable<Result<void, { kind: "unknown" }>> {
    return this.inviteRepositoryPort.rejectInvite(inviteId).pipe(
      tap(invite => this.eventBus.emit(rejectInvite(invite.id, invite.project.id, invite.user.id))),
      map(() => ok<void>(undefined)),
      catchError(() => of(fail({ kind: "unknown" as const })))
    );
  }
}
