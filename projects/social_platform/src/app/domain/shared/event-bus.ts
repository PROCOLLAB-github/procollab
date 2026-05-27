/** @format */

import { Injectable } from "@angular/core";
import { filter, map, Observable, Subject } from "rxjs";
import { DomainEvent } from "./domain-event";

/** In-memory pub/sub доменных событий. Чистый примитив домена, без сайд-эффектов. */
@Injectable({ providedIn: "root" })
export class EventBus {
  private readonly events$ = new Subject<DomainEvent>();

  /** Эмитит событие подписчикам. */
  emit<T extends DomainEvent>(event: T): void {
    this.events$.next(event);
  }

  /** Поток событий заданного типа. */
  on<T extends DomainEvent>(type: T["type"]): Observable<T> {
    return this.events$.pipe(
      filter(e => e.type === type),
      map(e => e as T)
    );
  }
}
