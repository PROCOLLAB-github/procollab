/** @format */

import { Injectable, computed, inject, signal } from "@angular/core";
import { Invite } from "@domain/invite/invite.model";
import {
  AsyncState,
  failure,
  initial,
  isFailure,
  isLoading,
  isSuccess,
  loading,
  success,
} from "@domain/shared/async-state";
import { RejectInviteUseCase } from "./use-cases/reject-invite.use-case";
import { Observable, finalize, share, shareReplay, tap } from "rxjs";
import { GetMyInvitesUseCase } from "./use-cases/get-my-invites.use-case";
import { AcceptInviteUseCase } from "./use-cases/accept-invite.use-case";
import { InviteResult } from "@domain/invite/results/invite.result";

@Injectable({ providedIn: "root" })
export class InviteInfoService {
  private readonly rejectInviteUseCase = inject(RejectInviteUseCase);
  private readonly acceptInviteUseCase = inject(AcceptInviteUseCase);
  private readonly getMyInvitesUseCase = inject(GetMyInvitesUseCase);

  private readonly invites$ = signal<AsyncState<Invite[]>>(initial());

  readonly invites = computed(() => {
    const state = this.invites$();
    if (isSuccess(state)) return state.data;
    if (isLoading(state)) return state.previous ?? [];
    if (isFailure(state)) return state.previous ?? [];
    return [];
  });

  readonly isLoading = computed(() => isLoading(this.invites$()));
  readonly isError = computed(() => isFailure(this.invites$()));

  // In-flight dedup: если уже идёт fetch — не стартуем второй.
  private inflight: Observable<unknown> | null = null;

  ensureLoaded(): void {
    const state = this.invites$();
    if (isLoading(state) || isSuccess(state)) return;
    this.fetch();
  }

  refresh(): void {
    this.fetch();
  }

  invalidate(): void {
    this.inflight = null;
    this.invites$.set(initial());
  }

  private fetch(): void {
    if (this.inflight) return; // дедуп параллельных вызывающих

    const state = this.invites$();
    const prev = isSuccess(state) ? state.data : undefined;
    this.invites$.set(loading(prev));

    this.inflight = this.getMyInvitesUseCase.execute().pipe(
      finalize(() => (this.inflight = null)),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.inflight.subscribe({
      next: (result: any) => {
        if (!result.ok) {
          this.invites$.set(failure(result.error, prev));
          return;
        }
        const active = result.value.filter((i: Invite) => i.isAccepted === null);
        this.invites$.set(success(active));
      },
      error: err => this.invites$.set(failure(err, prev)),
    });
  }

  rejectInviteAction(inviteId: number): Observable<InviteResult> {
    const before = this.invites$();
    this.removeFromState(inviteId);

    return this.rejectInviteUseCase.execute(inviteId).pipe(
      tap(result => {
        if (!result.ok) this.invites$.set(before);
      })
    );
  }

  acceptInviteAction(inviteId: number): Observable<InviteResult> {
    const before = this.invites$();
    this.removeFromState(inviteId);

    return this.acceptInviteUseCase.execute(inviteId).pipe(
      tap(result => {
        if (!result.ok) this.invites$.set(before); // revert при ошибке
      })
    );
  }

  /**
   * Синхронизация state'а после того, как внешний код (info-card)
   * уже выполнил accept/reject HTTP самостоятельно.
   * TODO: убрать после рефакторинга info-card — там HTTP делается
   *       параллельно нашему action-методу, что концептуально неверно.
   */
  markInviteHandled(inviteId: number): void {
    this.removeFromState(inviteId);
  }

  private removeFromState(inviteId: number): void {
    this.invites$.update(state =>
      isSuccess(state) ? success(state.data.filter(i => i.id !== inviteId)) : state
    );
  }
}
