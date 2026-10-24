/** @format */

import { computed, DestroyRef, inject, Injectable, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
  defer,
  distinctUntilChanged,
  finalize,
  map,
  merge,
  Observable,
  of,
  Subject,
  switchMap,
  takeUntil,
  tap,
  timer,
} from "rxjs";
import {
  SolutionApiError,
  SolutionInvitation,
  SolutionInvitationActionResult,
} from "@domain/solution/solution-contract.model";
import { fail, ok, Result } from "@domain/shared/result.type";
import {
  DecideSolutionInvitationUseCase,
  GetMySolutionInvitationsUseCase,
} from "../use-cases/solution-team.use-cases";

/** Один входящий список для desktop/mobile; состояние меняется вместе с пользователем. */
@Injectable()
export class SolutionInvitationInboxService {
  readonly items = signal<SolutionInvitation[]>([]);
  readonly loading = signal(false);
  private readonly loadError = signal("");
  private readonly actionError = signal("");
  readonly error = computed(() => this.actionError() || this.loadError());
  readonly pendingId = signal<number | null>(null);
  readonly count = computed(() => this.items().length);
  private readonly userChanges = new Subject<number | null>();
  private readonly refreshes = new Subject<void>();
  private readonly cancelActions = new Subject<void>();
  private readonly get = inject(GetMySolutionInvitationsUseCase);
  private readonly decide = inject(DecideSolutionInvitationUseCase);
  private readonly destroyRef = inject(DestroyRef);
  private currentUser: number | null = null;

  constructor() {
    this.userChanges
      .pipe(
        distinctUntilChanged(),
        switchMap(userId => {
          this.cancelActions.next();
          this.currentUser = userId;
          this.items.set([]);
          this.loadError.set("");
          this.actionError.set("");
          this.loading.set(false);
          this.pendingId.set(null);
          if (userId === null) return of(null);
          return merge(timer(0, 30000), this.refreshes).pipe(
            switchMap(() => {
              this.loading.set(true);
              return this.readAll().pipe(finalize(() => this.loading.set(false)));
            }),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe(result => {
        if (!result) return;
        if (result.ok) {
          this.items.set(result.value);
          this.loadError.set("");
        } else this.loadError.set(result.error.detail);
      });
  }

  bindUser(userId: number | null): void {
    this.userChanges.next(userId);
  }
  refresh(clearAction = true): void {
    if (clearAction) this.actionError.set("");
    this.refreshes.next();
  }

  private readAll(offset = 0): Observable<Result<SolutionInvitation[], SolutionApiError>> {
    return this.get.execute({ status: "pending", limit: 100, offset }).pipe(
      switchMap(result => {
        if (!result.ok) return of(fail(result.error));
        if (!result.value.next) return of(ok(result.value.results));
        if (!result.value.results.length)
          return of(
            fail({
              code: "invalid_response",
              detail: "Не удалось обновить приглашения.",
              errors: [],
              meta: {},
            }),
          );
        return this.readAll(offset + result.value.results.length).pipe(
          map(next => (next.ok ? ok([...result.value.results, ...next.value]) : fail(next.error))),
        );
      }),
    );
  }

  action(
    invitation: SolutionInvitation,
    decision: "accept" | "decline",
  ): Observable<Result<SolutionInvitationActionResult, SolutionApiError>> {
    return defer(() => {
      const allowed =
        decision === "accept"
          ? invitation.permissions.canAccept
          : invitation.permissions.canDecline;
      if (!allowed || this.pendingId() !== null || this.currentUser !== invitation.recipient.id)
        return of(
          fail({
            code: "forbidden",
            detail: "Действие с приглашением сейчас недоступно.",
            errors: [],
            meta: {},
          }),
        );
      this.pendingId.set(invitation.id);
      this.actionError.set("");
      return this.decide.execute(invitation.id, decision, invitation.version).pipe(
        takeUntil(this.cancelActions),
        takeUntilDestroyed(this.destroyRef),
        tap(result => {
          if (result.ok) {
            this.items.update(items => items.filter(item => item.id !== invitation.id));
            this.refresh(false);
          } else {
            this.actionError.set(result.error.detail);
            this.refresh(false);
          }
        }),
        finalize(() => this.pendingId.set(null)),
      );
    });
  }
}
