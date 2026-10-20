/** @format */

import { DestroyRef, Injectable, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
  BehaviorSubject,
  Subject,
  Subscription,
  catchError,
  finalize,
  fromEvent,
  map,
  merge,
  of,
  switchMap,
  takeUntil,
  timer,
} from "rxjs";
import { ApiService, TokenService } from "@corelib";
import { EventBus } from "@domain/shared/event-bus";
import { Notification } from "@domain/other/notification.model";

interface NotificationPage {
  results: Notification[];
  unreadCount: number;
}

@Injectable({ providedIn: "root" })
export class NotificationService {
  private readonly api = inject(ApiService);
  private readonly tokens = inject(TokenService);
  private readonly events = inject(EventBus);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cancel = new Subject<void>();
  private connection?: Subscription;
  readonly notifications = new BehaviorSubject<Notification[]>([]);
  private readonly unread = new BehaviorSubject(0);
  readonly hasNotifications = this.unread.asObservable();
  readonly failed = signal(false);
  readonly reading = signal<string | null>(null);

  constructor() {
    this.events
      .on("LoggedOut")
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.stop());
  }

  start(): void {
    this.stop();
    this.connection = merge(timer(0, 30_000), fromEvent(window, "focus"))
      .pipe(
        switchMap(() => this.load()),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(page => {
        if (!page) return;
        this.notifications.next(page.results);
        this.unread.next(page.unreadCount);
      });
  }

  stop(): void {
    this.cancel.next();
    this.connection?.unsubscribe();
    this.notifications.next([]);
    this.unread.next(0);
    this.failed.set(false);
  }

  private load() {
    if (!this.tokens.getTokens()) return of({ results: [], unreadCount: 0 });
    return this.api.get<NotificationPage>("/core/notifications/").pipe(
      map(page => {
        this.failed.set(false);
        return page;
      }),
      catchError(() => {
        this.failed.set(true);
        return of(null);
      }),
    );
  }

  read(notice: Notification): void {
    if (notice.readAt || this.reading() !== null) return;
    this.reading.set(notice.id);
    this.api
      .post<{ id: string; readAt: string; unreadCount: number }>(
        `/core/notifications/${notice.id}/read/`,
        {},
      )
      .pipe(
        takeUntil(this.cancel),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.reading.set(null)),
      )
      .subscribe({
        next: data => {
          this.notifications.next(
            this.notifications.value.map(row =>
              row.id === data.id ? { ...row, readAt: data.readAt } : row,
            ),
          );
          this.unread.next(data.unreadCount);
        },
        error: () => this.failed.set(true),
      });
  }
}
