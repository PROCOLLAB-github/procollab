/** @format */

import { inject, Injectable } from "@angular/core";
import { InviteRepositoryPort } from "../../../domain/invite/ports/invite.repository.port";
import { UpdateInviteCommand } from "../../../domain/invite/commands/update-invite.command";
import { catchError, map, Observable, of } from "rxjs";
import { fail, ok, Result } from "../../../domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class UpdateInviteUseCase {
  private readonly inviteRepositoryPort = inject(InviteRepositoryPort);

  execute({
    inviteId,
    role,
    specialization,
  }: UpdateInviteCommand): Observable<
    Result<void, { kind: "update_invite_error"; cause?: unknown }>
  > {
    return this.inviteRepositoryPort.updateInvite(inviteId, role, specialization).pipe(
      map(() => ok<void>(undefined)),
      catchError(error => of(fail({ kind: "update_invite_error" as const, cause: error })))
    );
  }
}
