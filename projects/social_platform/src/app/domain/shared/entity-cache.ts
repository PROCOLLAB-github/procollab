/** @format */

import { Observable, shareReplay } from "rxjs";

export class EntityCache<T> {
  private readonly store = new Map<number, Observable<T>>();

  getOrFetch(id: number, factory: () => Observable<T>): Observable<T> {
    if (!this.store.has(id)) {
      const entity$ = factory().pipe(shareReplay(1));

      this.store.set(id, entity$);
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.store.get(id)!;
  }

  invalidate(id: number): void {
    this.store.delete(id);
  }

  clear(): void {
    this.store.clear();
  }
}
