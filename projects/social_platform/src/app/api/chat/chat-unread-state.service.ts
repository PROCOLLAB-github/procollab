/** @format */

import { Injectable, computed, inject, signal } from "@angular/core";
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
import { CheckUnreadsUseCase } from "./use-cases/check-unreads.use-case";
import { Observable, finalize, shareReplay } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class ChatUnreadStateService {
  private readonly checkUnreadsUseCase = inject(CheckUnreadsUseCase);

  private readonly hasUnreads$ = signal<AsyncState<boolean, unknown>>(initial());

  readonly hasUnreads = computed(() => {
    const state = this.hasUnreads$();
    if (isSuccess(state)) return state.data;
    if (isLoading(state)) return state.previous ?? false;
    if (isFailure(state)) return state.previous ?? false;
    return false;
  });

  private inflight: Observable<unknown> | null = null;

  ensureLoaded() {
    if (isLoading(this.hasUnreads$()) || isSuccess(this.hasUnreads$())) return;
    this.fetch();
  }

  refresh() {
    this.inflight = null;
    this.fetch();
  }

  private fetch() {
    if (this.inflight) return;

    const state = this.hasUnreads$();
    const prev = isSuccess(state) ? state.data : undefined;
    this.hasUnreads$.set(loading(prev));

    const request$ = this.checkUnreadsUseCase.execute().pipe(
      finalize(() => {
        this.inflight = null;
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );
    this.inflight = request$;

    request$.subscribe({
      next: result => {
        if (!result.ok) {
          this.hasUnreads$.set(failure(result.error, prev));
          return;
        }

        this.hasUnreads$.set(success(result.value));
      },
      error: error => this.hasUnreads$.set(failure(error, prev)),
    });
  }

  invalidate() {
    this.inflight = null;
    this.hasUnreads$.set(initial());
  }

  /** Локальный сброс индикатора при заходе в чат — без HTTP. */
  markRead(): void {
    this.hasUnreads$.set(success(false));
  }
}
