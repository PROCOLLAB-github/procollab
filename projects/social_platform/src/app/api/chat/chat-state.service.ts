/** @format */

import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({ providedIn: "root" })
export class ChatStateService {
  readonly unread$ = new BehaviorSubject(false);
  readonly userOnlineStatusCache = new BehaviorSubject<Record<number, boolean>>({});

  setUnread(unread: boolean): void {
    this.unread$.next(unread);
  }

  setOnlineStatus(userId: number, status: boolean): void {
    this.userOnlineStatusCache.next({
      ...this.userOnlineStatusCache.value,
      [userId]: status,
    });
  }
}
