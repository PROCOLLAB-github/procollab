/** @format */

import { Injectable } from "@angular/core";
import { filter, map, Observable, Subject } from "rxjs";
import { DomainEvent } from "./domain-event";

@Injectable({ providedIn: "root" })
export class EventBus {
  private readonly events$ = new Subject<DomainEvent>();

  emit<T extends DomainEvent>(event: T): void {
    this.events$.next(event);
  }

  on<T extends DomainEvent>(type: T["type"]): Observable<T> {
    return this.events$.pipe(
      filter(e => e.type === type),
      map(e => e as T)
    );
  }
}
