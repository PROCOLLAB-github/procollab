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
import { clearCacheKey, readCache, writeCache } from "@utils/cache";
import { plainToInstance } from "class-transformer";
import { Observable, finalize, shareReplay } from "rxjs";

const INDUSTRIES_CACHE_KEY = "industries";
const INDUSTRIES_CACHE_VERSION = 1;
const TTL_24H = 24 * 60 * 60 * 1000;

/** Стейт справочника отраслей: идемпотентная загрузка, сигнал, синхронный поиск. */
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

    const cached = readCache<Industry[]>(
      INDUSTRIES_CACHE_KEY,
      INDUSTRIES_CACHE_VERSION,
      TTL_24H,
      raw => plainToInstance(Industry, raw as object[]) as Industry[],
    );

    if (cached) {
      // мгновенно показываем данные из кеша
      this.industries$.set(success(cached));
      // и в фоне инициируем обновление (fetch() сам ставит loading(prev), UI всё ещё видит prev)
      this.fetch();
      return;
    }

    this.fetch();
  }

  refresh(): void {
    this.inflight = null;
    this.fetch();
  }

  invalidate(): void {
    this.inflight = null;
    this.industries$.set(initial());
    clearCacheKey(INDUSTRIES_CACHE_KEY, INDUSTRIES_CACHE_VERSION);
  }

  /** Поиск отрасли в загруженном справочнике. */
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
      shareReplay({ bufferSize: 1, refCount: true }),
    );
    this.inflight = request$;

    request$.subscribe({
      next: industries => {
        this.industries$.set(success(industries));
        writeCache(INDUSTRIES_CACHE_KEY, INDUSTRIES_CACHE_VERSION, industries);
      },
      error: error => this.industries$.set(failure(error)),
    });
  }
}
