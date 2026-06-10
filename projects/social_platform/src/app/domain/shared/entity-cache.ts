/** @format */

import { Observable, shareReplay, switchMap, of, Subscription } from "rxjs";

/**
 * In-memory кэш с опциональным TTL и stale-while-revalidate.
 *
 * - Без ttlMs: кэш бесконечный (только ручная инвалидация).
 * - С ttlMs: после истечения TTL `getOrFetch` возвращает стухшие данные
 *   немедленно + запускает фоновый re-fetch. Когда рефетч завершается —
 *   подписчики получают свежие данные через `switchMap`.
 */
export class EntityCache<T> {
  private readonly store = new Map<number, { observable: Observable<T>; expiresAt: number }>();
  private readonly inflight = new Map<number, Subscription>();

  constructor(private readonly ttlMs?: number) {}

  getOrFetch(id: number, factory: () => Observable<T>): Observable<T> {
    const entry = this.store.get(id);
    const isExpired = this.ttlMs != null && entry && Date.now() >= entry.expiresAt;
    const isValid = entry && !isExpired;

    if (isValid) {
      return entry.observable;
    }

    if (isExpired) {
      this.scheduleRevalidate(id, factory);
      return entry.observable;
    }

    return this.fetchAndStore(id, factory);
  }

  invalidate(id: number): void {
    this.inflight.get(id)?.unsubscribe();
    this.inflight.delete(id);
    this.store.delete(id);
  }

  clear(): void {
    this.inflight.forEach(sub => sub.unsubscribe());
    this.inflight.clear();
    this.store.clear();
  }

  private fetchAndStore(id: number, factory: () => Observable<T>): Observable<T> {
    const observable$ = factory().pipe(shareReplay(1));
    this.store.set(id, {
      observable: observable$,
      expiresAt: this.ttlMs ? Date.now() + this.ttlMs : Infinity,
    });
    return observable$;
  }

  private scheduleRevalidate(id: number, factory: () => Observable<T>): void {
    if (this.inflight.has(id)) return;

    const sub = factory()
      .pipe(shareReplay(1))
      .subscribe({
        next: fresh => {
          this.store.set(id, {
            observable: of(fresh),
            expiresAt: this.ttlMs ? Date.now() + this.ttlMs : Infinity,
          });
        },
        error: () => {
          this.inflight.delete(id);
        },
        complete: () => {
          this.inflight.delete(id);
        },
      });

    this.inflight.set(id, sub);
  }
}
