/** @format */

import { inject, Injectable } from "@angular/core";
import { InviteRepositoryPort } from "@domain/invite/ports/invite.repository.port";
import { SendForUserCommand } from "@domain/invite/commands/send-for-user.command";
import { catchError, map, Observable, of } from "rxjs";
import { fail, ok, Result } from "@domain/shared/result.type";
import { Invite } from "@domain/invite/invite.model";

@Injectable({ providedIn: "root" })
export class SendForUserUseCase {
  private readonly inviteRepositoryPort = inject(InviteRepositoryPort);

  execute({
    userId,
    projectId,
    role,
    specialization,
  }: SendForUserCommand): Observable<Result<Invite, { kind: "invite_error"; cause?: unknown }>> {
    return this.inviteRepositoryPort.sendForUser(userId, projectId, role, specialization).pipe(
      map(invite => ok<Invite>(invite)),
      catchError(error => of(fail({ kind: "invite_error" as const, cause: error })))
    );
  }
}
