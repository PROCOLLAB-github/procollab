/** @format */

import { inject, Injectable } from "@angular/core";
import { plainToInstance } from "class-transformer";
import { BehaviorSubject, map, Observable } from "rxjs";
import { Invite } from "@domain/invite/invite.model";
import { InviteHttpAdapter } from "../../adapters/invite/invite-http.adapter";
import { InviteRepositoryPort } from "@domain/invite/ports/invite.repository.port";
import { EventBus } from "@domain/shared/event-bus";
import { AcceptInvite } from "@domain/invite/events/accept-invite.event";
import { RejectInvite } from "@domain/invite/events/reject-invite.event";
import { RevokeInvite } from "@domain/invite/events/revoke-invite.event";
import { userFromRaw } from "@utils/userRaw";

/** Репозиторий приглашений с локальным счётчиком входящих инвайтов. */
@Injectable({ providedIn: "root" })
export class InviteRepository implements InviteRepositoryPort {
  private readonly inviteAdapter = inject(InviteHttpAdapter);
  private readonly eventBus = inject(EventBus);

  readonly myInvitesCount$ = new BehaviorSubject<number>(0);

  constructor() {
    this.initializeEventListeners();
  }

  private initializeEventListeners(): void {
    // Принятие, отклонение и отзыв уменьшают локальный счётчик входящих приглашений.
    this.eventBus.on<AcceptInvite>("AcceptInvite").subscribe({
      next: () => {
        const currentCount = this.myInvitesCount$.getValue();
        this.myInvitesCount$.next(Math.max(0, currentCount - 1));
      },
    });

    this.eventBus.on<RejectInvite>("RejectInvite").subscribe({
      next: () => {
        const currentCount = this.myInvitesCount$.getValue();
        this.myInvitesCount$.next(Math.max(0, currentCount - 1));
      },
    });

    this.eventBus.on<RevokeInvite>("RevokeInvite").subscribe({
      next: () => {
        const currentCount = this.myInvitesCount$.getValue();
        this.myInvitesCount$.next(Math.max(0, currentCount - 1));
      },
    });
  }

  /**
   * Отправляет приглашение и маппит ответ в доменную модель `Invite`.
   */
  sendForUser(
    userId: number,
    projectId: number,
    role: string,
    specialization?: string,
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
    return this.inviteAdapter.getMy().pipe(
      map(invites =>
        (invites ?? []).map(raw => {
          // Бэк отдаёт sender/user плоско (без personal) — прогоняем через userFromRaw,
          // иначе sender.personal.avatar в карточке инвайта undefined.
          const invite = plainToInstance(Invite, raw);
          invite.sender = userFromRaw(raw.sender);
          invite.user = userFromRaw(raw.user);
          return invite;
        }),
      ),
    );
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
