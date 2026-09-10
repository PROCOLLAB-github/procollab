/** @format */

import { inject, Injectable } from "@angular/core";
import { InviteRepositoryPort } from "@domain/invite/ports/invite.repository.port";
import { SendForUserCommand } from "@domain/invite/commands/send-for-user.command";
import { catchError, map, Observable, of } from "rxjs";
import { fail, ok, Result } from "@domain/shared/result.type";
import { Invite } from "@domain/invite/invite.model";
import { InviteSendError } from "@domain/invite/invite-send-error";
import { mapInviteSendError } from "../mappers/map-invite-send-error";

/** Отправляет приглашение, преобразуя HTTP-ошибки в безопасный контракт формы. */
@Injectable({ providedIn: "root" })
export class SendForUserUseCase {
  private readonly inviteRepositoryPort = inject(InviteRepositoryPort);

  execute({
    userId,
    projectId,
    role,
    specialization,
  }: SendForUserCommand): Observable<Result<Invite, InviteSendError>> {
    return this.inviteRepositoryPort.sendForUser(userId, projectId, role, specialization).pipe(
      map(invite => ok<Invite>(invite)),
      catchError(error => of(fail(mapInviteSendError(error)))),
    );
  }
}
