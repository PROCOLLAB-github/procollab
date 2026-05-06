/** @format */

import { Observable } from "rxjs";
import { Invite } from "../invite.model";

/**
 * Порт репозитория приглашений.
 * Реализуется в infrastructure/repository/invite/invite.repository.ts
 */
export abstract class InviteRepositoryPort {
  abstract sendForUser(
    userId: number,
    projectId: number,
    role: string,
    specialization?: string
  ): Observable<Invite>;
  abstract revokeInvite(invitationId: number): Observable<Invite>;
  abstract acceptInvite(inviteId: number): Observable<Invite>;
  abstract rejectInvite(inviteId: number): Observable<Invite>;
  abstract updateInvite(
    inviteId: number,
    role: string,
    specialization?: string
  ): Observable<Invite>;
  abstract getMy(): Observable<Invite[]>;
  abstract getByProject(projectId: number): Observable<Invite[]>;
}
