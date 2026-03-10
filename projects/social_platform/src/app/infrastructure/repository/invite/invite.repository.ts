/** @format */

import { inject, Injectable } from "@angular/core";
import { plainToInstance } from "class-transformer";
import { map, Observable } from "rxjs";
import { Invite } from "../../../domain/invite/invite.model";
import { InviteHttpAdapter } from "../../adapters/invite/invite-http.adapter";

@Injectable({ providedIn: "root" })
export class InviteRepository {
  private readonly inviteAdapter = inject(InviteHttpAdapter);

  /**
   * Отправляет приглашение и маппит ответ в доменную модель `Invite`.
   */
  sendForUser(
    userId: number,
    projectId: number,
    role: string,
    specialization?: string
  ): Observable<Invite> {
    return this.inviteAdapter
      .sendForUser(userId, projectId, role, specialization)
      .pipe(map(invite => plainToInstance(Invite, invite)));
  }

  revokeInvite(invitationId: number): Observable<void> {
    return this.inviteAdapter.revokeInvite(invitationId);
  }

  /**
   * Принимает приглашение и маппит ответ в доменную модель `Invite`.
   */
  acceptInvite(inviteId: number): Observable<Invite> {
    return this.inviteAdapter
      .acceptInvite(inviteId)
      .pipe(map(invite => plainToInstance(Invite, invite)));
  }

  /**
   * Отклоняет приглашение и маппит ответ в доменную модель `Invite`.
   */
  rejectInvite(inviteId: number): Observable<Invite> {
    return this.inviteAdapter
      .rejectInvite(inviteId)
      .pipe(map(invite => plainToInstance(Invite, invite)));
  }

  /**
   * Обновляет приглашение и маппит ответ в доменную модель `Invite`.
   */
  updateInvite(inviteId: number, role: string, specialization?: string): Observable<Invite> {
    return this.inviteAdapter
      .updateInvite(inviteId, role, specialization)
      .pipe(map(invite => plainToInstance(Invite, invite)));
  }

  /**
   * Получает приглашения текущего пользователя и маппит их в доменную модель `Invite`.
   */
  getMy(): Observable<Invite[]> {
    return this.inviteAdapter.getMy().pipe(map(invites => plainToInstance(Invite, invites)));
  }

  /**
   * Получает приглашения по проекту и маппит их в доменную модель `Invite`.
   */
  getByProject(projectId: number): Observable<Invite[]> {
    return this.inviteAdapter
      .getByProject(projectId)
      .pipe(map(invites => plainToInstance(Invite, invites)));
  }
}
