/** @format */

import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

/** Глобальное состояние чата: онлайн-статусы пользователей, сброс. */
@Injectable({ providedIn: "root" })
export class ChatStateService {
  readonly userOnlineStatusCache = new BehaviorSubject<Record<number, boolean>>({});

  setOnlineStatus(userId: number, status: boolean): void {
    this.userOnlineStatusCache.next({
      ...this.userOnlineStatusCache.value,
      [userId]: status,
    });
  }

  reset(): void {
    this.userOnlineStatusCache.next({});
  }
}
