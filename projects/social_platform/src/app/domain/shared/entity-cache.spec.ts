/** @format */

import { fakeAsync, flush, tick } from "@angular/core/testing";
import { Observable, of, Subject } from "rxjs";
import { EntityCache } from "./entity-cache";

describe("EntityCache", () => {
  let cache: EntityCache<string>;
  let factoryCallCount: number;
  const factory = (): Observable<string> => {
    factoryCallCount++;
    return of(`value-${factoryCallCount}`);
  };

  beforeEach(() => {
    cache = new EntityCache<string>();
    factoryCallCount = 0;
  });

  it("возвращает один и тот же Observable при повторном getOrFetch", done => {
    const first = cache.getOrFetch(1, factory);
    const second = cache.getOrFetch(1, factory);

    expect(first).toBe(second);
    expect(factoryCallCount).toBe(1);

    first.subscribe(value => {
      expect(value).toBe("value-1");
      done();
    });
  });

  it("разные id — разные Observable", () => {
    const a = cache.getOrFetch(1, factory);
    const b = cache.getOrFetch(2, factory);

    expect(a).not.toBe(b);
    expect(factoryCallCount).toBe(2);
  });

  it("invalidate удаляет запись — следующий getOrFetch создаёт новый Observable", () => {
    const first = cache.getOrFetch(1, factory);
    cache.invalidate(1);
    const second = cache.getOrFetch(1, factory);

    expect(first).not.toBe(second);
    expect(factoryCallCount).toBe(2);
  });

  it("clear удаляет все записи", () => {
    cache.getOrFetch(1, factory);
    cache.getOrFetch(2, factory);
    cache.clear();

    cache.getOrFetch(1, factory);
    cache.getOrFetch(2, factory);

    expect(factoryCallCount).toBe(4);
  });

  describe("с TTL", () => {
    beforeEach(() => {
      jasmine.clock().install();
    });

    afterEach(() => {
      jasmine.clock().uninstall();
    });

    it("возвращает кешированный Observable до истечения TTL", () => {
      const ttlCache = new EntityCache<string>(5000);
      const first = ttlCache.getOrFetch(1, factory);
      const second = ttlCache.getOrFetch(1, factory);

      expect(first).toBe(second);
      expect(factoryCallCount).toBe(1);
    });

    it("до истечения TTL — не обновляет", () => {
      const ttlCache = new EntityCache<string>(5000);
      const first = ttlCache.getOrFetch(1, factory);

      jasmine.clock().mockDate(new Date(Date.now() + 3000));

      const second = ttlCache.getOrFetch(1, factory);

      expect(first).toBe(second);
      expect(factoryCallCount).toBe(1);
    });

    it("invalidate работает даже с TTL", () => {
      const ttlCache = new EntityCache<string>(5000);
      const first = ttlCache.getOrFetch(1, factory);
      ttlCache.invalidate(1);
      const second = ttlCache.getOrFetch(1, factory);

      expect(first).not.toBe(second);
      expect(factoryCallCount).toBe(2);
    });
  });

  describe("stale-while-revalidate", () => {
    let subject$: Subject<string>;
    let swrCache: EntityCache<string>;
    let swrFactoryCallCount: number;

    beforeEach(() => {
      jasmine.clock().install();
      subject$ = new Subject<string>();
      swrCache = new EntityCache<string>(5000);
      swrFactoryCallCount = 0;
    });

    afterEach(() => {
      jasmine.clock().uninstall();
    });

    it("после TTL возвращает стухшие данные немедленно", () => {
      swrCache.getOrFetch(1, () => of("initial"));

      jasmine.clock().mockDate(new Date(Date.now() + 6000));

      let emitted = "";
      swrCache.getOrFetch(1, () => of("refreshed")).subscribe(v => (emitted = v));

      expect(emitted).toBe("initial");
    });

    it("после TTL запускает фоновый re-fetch", fakeAsync(() => {
      swrCache.getOrFetch(1, () => of("initial"));

      jasmine.clock().mockDate(new Date(Date.now() + 6000));

      swrCache.getOrFetch(1, () => {
        swrFactoryCallCount++;
        return of("fresh");
      });

      expect(swrFactoryCallCount).toBe(1);

      tick(0);
      flush();

      let latest = "";
      swrCache.getOrFetch(1, () => of("should-not-happen")).subscribe(v => (latest = v));

      expect(latest).toBe("fresh");
    }));

    it("не запускает повторный re-fetch если предыдущий ещё летит", () => {
      swrCache.getOrFetch(1, () => of("initial"));

      jasmine.clock().mockDate(new Date(Date.now() + 6000));

      const longSubject = new Subject<string>();
      swrCache.getOrFetch(1, () => {
        swrFactoryCallCount++;
        return longSubject;
      });

      swrCache.getOrFetch(1, () => {
        swrFactoryCallCount++;
        return of("second");
      });

      expect(swrFactoryCallCount).toBe(1);

      longSubject.complete();
    });

    it("invalidate останавливает фоновый re-fetch", () => {
      swrCache.getOrFetch(1, () => of("initial"));

      jasmine.clock().mockDate(new Date(Date.now() + 6000));

      const longSubject = new Subject<string>();
      swrCache.getOrFetch(1, () => {
        swrFactoryCallCount++;
        return longSubject;
      });

      swrCache.invalidate(1);

      longSubject.next("late");
      longSubject.complete();

      const result = swrCache.getOrFetch(1, () => of("after-invalidate"));
      let value = "";
      result.subscribe(v => (value = v));

      expect(value).toBe("after-invalidate");
      expect(swrFactoryCallCount).toBe(2);
    });
  });
});
