/** @format */

import { computed, DestroyRef, inject, Injectable, Injector, signal } from "@angular/core";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { Router } from "@angular/router";
import { GetNotificationUnreadCountUseCase } from "@api/notification/use-cases/get-notification-unread-count.use-case";
import { GetNotificationsUseCase } from "@api/notification/use-cases/get-notifications.use-case";
import { MarkAllNotificationsReadUseCase } from "@api/notification/use-cases/mark-all-notifications-read.use-case";
import { MarkNotificationReadUseCase } from "@api/notification/use-cases/mark-notification-read.use-case";
import { normalizeNotificationActionUrl } from "@domain/notification/notification-action-url";
import { Notification } from "@domain/notification/notification.model";
import { SnackbarService } from "@domain/shared/snackbar.service";
import { exhaustMap, filter, finalize, fromEvent, Subject, timer } from "rxjs";

const PAGE_SIZE = 20;
const UNREAD_POLL_INTERVAL = 60_000;

type FailedOperation = "firstPage" | "loadMore" | null;

/** Office-scoped facade/state для production Notification API. */
@Injectable({ providedIn: "root" })
export class NotificationService {
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  private readonly notificationsState = signal<Notification[]>([]);
  readonly notifications = this.notificationsState.asReadonly();
  readonly totalCount = signal(0);
  readonly unreadCount = signal(0);
  readonly loading = signal(false);
  readonly loadingMore = signal(false);
  readonly markingAllRead = signal(false);
  readonly error = signal<string | null>(null);
  readonly hasMore = computed(() => this.notifications().length < this.totalCount());
  readonly hasUnreadNotifications = computed(() => this.unreadCount() > 0);

  /** Compatibility observable для legacy Header/Nav, которые не являются PROD integration point. */
  readonly hasNotifications = toObservable(this.hasUnreadNotifications);

  private readonly unreadRefreshRequests = new Subject<void>();
  private readonly pendingReadIds = new Set<number>();
  private initialized = false;
  private failedOperation: FailedOperation = null;

  private get getNotificationsUseCase(): GetNotificationsUseCase {
    return this.injector.get(GetNotificationsUseCase);
  }

  private get getUnreadCountUseCase(): GetNotificationUnreadCountUseCase {
    return this.injector.get(GetNotificationUnreadCountUseCase);
  }

  private get markNotificationReadUseCase(): MarkNotificationReadUseCase {
    return this.injector.get(MarkNotificationReadUseCase);
  }

  private get markAllNotificationsReadUseCase(): MarkAllNotificationsReadUseCase {
    return this.injector.get(MarkAllNotificationsReadUseCase);
  }

  private get snackbar(): SnackbarService {
    return this.injector.get(SnackbarService);
  }

  private get router(): Router {
    return this.injector.get(Router);
  }

  constructor() {
    this.unreadRefreshRequests
      .pipe(
        exhaustMap(() => this.getUnreadCountUseCase.execute()),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(result => {
        if (result.ok) this.unreadCount.set(result.value);
      });
  }

  /** Запускается один раз компонентом Office и живёт только в его injector scope. */
  initialize(): void {
    if (this.initialized) return;
    this.initialized = true;

    this.refreshFirstPage();
    this.refreshUnreadCount();

    timer(UNREAD_POLL_INTERVAL, UNREAD_POLL_INTERVAL)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.refreshUnreadCount());

    fromEvent(document, "visibilitychange")
      .pipe(
        filter(() => document.visibilityState === "visible"),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.refreshUnreadCount());
  }

  onPopupOpenChange(open: boolean): void {
    if (!open) return;
    this.refreshFirstPage();
    this.refreshUnreadCount();
  }

  refreshFirstPage(): void {
    if (this.loading() || this.loadingMore()) return;

    this.loading.set(true);
    this.error.set(null);
    this.getNotificationsUseCase
      .execute({ limit: PAGE_SIZE, offset: 0 })
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(result => {
        if (!result.ok) {
          this.error.set("Не удалось загрузить уведомления");
          this.failedOperation = "firstPage";
          return;
        }

        this.notificationsState.set(this.uniqueById(result.value.results));
        this.totalCount.set(result.value.count);
        this.unreadCount.set(result.value.unreadCount);
        this.failedOperation = null;
      });
  }

  refreshUnreadCount(): void {
    this.unreadRefreshRequests.next();
  }

  loadMore(): void {
    if (this.loading() || this.loadingMore() || !this.hasMore()) return;

    this.loadingMore.set(true);
    this.error.set(null);
    this.getNotificationsUseCase
      .execute({ limit: PAGE_SIZE, offset: this.notifications().length })
      .pipe(
        finalize(() => this.loadingMore.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(result => {
        if (!result.ok) {
          this.error.set("Не удалось загрузить уведомления");
          this.failedOperation = "loadMore";
          return;
        }

        this.notificationsState.set(
          this.uniqueById([...this.notifications(), ...result.value.results]),
        );
        this.totalCount.set(result.value.count);
        this.unreadCount.set(result.value.unreadCount);
        this.failedOperation = null;
      });
  }

  retry(): void {
    if (this.failedOperation === "loadMore") {
      this.loadMore();
      return;
    }
    this.refreshFirstPage();
  }

  markAllRead(): void {
    if (this.markingAllRead() || this.unreadCount() === 0) return;

    this.markingAllRead.set(true);
    this.markAllNotificationsReadUseCase
      .execute()
      .pipe(
        finalize(() => this.markingAllRead.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(result => {
        if (!result.ok) {
          this.snackbar.error("Не удалось прочитать все уведомления");
          return;
        }

        const readAt = new Date().toISOString();
        this.notificationsState.update(notifications =>
          notifications.map(notification =>
            notification.readAt ? notification : { ...notification, readAt },
          ),
        );
        this.unreadCount.set(result.value.unreadCount);
      });
  }

  openNotification(notification: Notification): void {
    const actionUrl = normalizeNotificationActionUrl(notification);
    if (notification.readAt) {
      this.navigateToAction(actionUrl);
      return;
    }
    if (this.pendingReadIds.has(notification.id)) return;

    this.pendingReadIds.add(notification.id);
    this.markNotificationReadUseCase
      .execute(notification.id)
      .pipe(
        finalize(() => this.pendingReadIds.delete(notification.id)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(result => {
        if (!result.ok) {
          this.snackbar.error("Не удалось отметить уведомление прочитанным");
          return;
        }

        let changedUnreadNotification = false;
        this.notificationsState.update(notifications =>
          notifications.map(current => {
            if (current.id !== notification.id) return current;
            changedUnreadNotification = current.readAt === null;
            return result.value;
          }),
        );
        if (changedUnreadNotification) {
          this.unreadCount.update(count => Math.max(0, count - 1));
        }
        this.navigateToAction(actionUrl);
      });
  }

  private navigateToAction(actionUrl: string | null): void {
    if (actionUrl) void this.router.navigateByUrl(actionUrl);
  }

  private uniqueById(notifications: Notification[]): Notification[] {
    const unique = new Map<number, Notification>();
    notifications.forEach(notification => unique.set(notification.id, notification));
    return [...unique.values()];
  }
}
