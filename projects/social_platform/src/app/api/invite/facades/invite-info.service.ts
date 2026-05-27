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
import { Observable, finalize, shareReplay, tap } from "rxjs";
import { InviteResult } from "@domain/invite/results/invite.result";
import { RejectInviteUseCase } from "../use-cases/reject-invite.use-case";
import { AcceptInviteUseCase } from "../use-cases/accept-invite.use-case";
import { GetMyInvitesUseCase } from "../use-cases/get-my-invites.use-case";

/** Facade приглашений: список «моих» инвайтов + accept/reject через use-case'ы. */
@Injectable({ providedIn: "root" })
export class InviteInfoService {
  private readonly rejectInviteUseCase = inject(RejectInviteUseCase);
  private readonly acceptInviteUseCase = inject(AcceptInviteUseCase);
  private readonly getMyInvitesUseCase = inject(GetMyInvitesUseCase);

  private readonly invites$ = signal<AsyncState<Invite[], unknown>>(initial());

  readonly invites = computed(() => {
    const state = this.invites$();
    if (isSuccess(state)) return state.data;
    if (isLoading(state)) return state.previous ?? [];
    if (isFailure(state)) return state.previous ?? [];
    return [];
  });

  readonly isLoading = computed(() => isLoading(this.invites$()));

  // In-flight dedup: если уже идёт fetch — не стартуем второй.
  private inflight: Observable<unknown> | null = null;

  ensureLoaded(): void {
    if (this.isLoading() || isSuccess(this.invites$())) return;
    this.fetch();
  }

  refresh(): void {
    this.inflight = null;
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

    const request$ = this.getMyInvitesUseCase.execute().pipe(
      finalize(() => (this.inflight = null)),
      shareReplay({ bufferSize: 1, refCount: true })
    );
    this.inflight = request$;

    request$.subscribe({
      next: result => {
        if (!result.ok) {
          this.invites$.set(failure(result.error, prev));
          return;
        }
        const active = result.value.filter(i => i.isAccepted === null);
        this.invites$.set(success(active));
      },
      error: err => this.invites$.set(failure(err, prev)),
    });
  }

  rejectInviteAction(inviteId: number): Observable<InviteResult> {
    this.removeFromState(inviteId); // оптимистично убираем

    return this.rejectInviteUseCase.execute(inviteId).pipe(
      tap(result => {
        // На ошибке (в т.ч. 409 «уже обработан») ре-синк с сервером, а не revert:
        // иначе стухший инвайт возвращается в список и «не пропадает».
        if (!result.ok) this.refresh();
      })
    );
  }

  acceptInviteAction(inviteId: number): Observable<InviteResult> {
    this.removeFromState(inviteId);

    return this.acceptInviteUseCase.execute(inviteId).pipe(
      tap(result => {
        if (!result.ok) this.refresh();
      })
    );
  }

  private removeFromState(inviteId: number): void {
    this.invites$.update(state =>
      isSuccess(state) ? success(state.data.filter(i => i.id !== inviteId)) : state
    );
  }
}
