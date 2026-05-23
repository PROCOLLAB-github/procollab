/** @format */

import { Injectable, computed, inject, signal } from "@angular/core";
import { Industry } from "@domain/industry/industry.model";
import { IndustryRepositoryPort } from "@domain/industry/ports/industry.repository.port";
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
import { Observable, finalize, shareReplay } from "rxjs";

/**
 * Стейт справочника отраслей: идемпотентная загрузка (`ensureLoaded`),
 * сигнал `industries` и синхронный `getOne(id)`.
 * Единый источник для UI/api-слоя вместо прямого доступа к `IndustryRepository`.
 */
@Injectable({ providedIn: "root" })
export class IndustryStateInfoService {
  private readonly industryRepository = inject(IndustryRepositoryPort);

  private readonly industries$ = signal<AsyncState<Industry[]>>(initial());

  readonly industries = computed(() => {
    const state = this.industries$();
    if (isSuccess(state)) return state.data;
    if (isLoading(state)) return state.previous ?? [];
    if (isFailure(state)) return state.previous ?? [];
    return [];
  });

  readonly isLoading = computed(() => isLoading(this.industries$()));

  private inflight: Observable<Industry[]> | null = null;

  ensureLoaded(): void {
    if (this.isLoading() || isSuccess(this.industries$())) return;
    this.fetch();
  }

  refresh(): void {
    this.inflight = null;
    this.fetch();
  }

  invalidate(): void {
    this.inflight = null;
    this.industries$.set(initial());
  }

  /** Синхронный поиск отрасли в загруженном справочнике. */
  getOne(industryId: number): Industry | undefined {
    return this.industries().find(industry => industry.id === industryId);
  }

  private fetch(): void {
    if (this.inflight) return;

    const state = this.industries$();
    const prev = isSuccess(state) ? state.data : undefined;
    this.industries$.set(loading(prev));

    const request$ = this.industryRepository.getAll().pipe(
      finalize(() => (this.inflight = null)),
      shareReplay({ bufferSize: 1, refCount: true })
    );
    this.inflight = request$;

    request$.subscribe({
      next: industries => this.industries$.set(success(industries)),
      error: error => this.industries$.set(failure(error)),
    });
  }
}
