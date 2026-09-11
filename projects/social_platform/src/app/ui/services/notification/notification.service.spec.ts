/** @format */

import { TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { GetNotificationUnreadCountUseCase } from "@api/notification/use-cases/get-notification-unread-count.use-case";
import { GetNotificationsUseCase } from "@api/notification/use-cases/get-notifications.use-case";
import { MarkAllNotificationsReadUseCase } from "@api/notification/use-cases/mark-all-notifications-read.use-case";
import { MarkNotificationReadUseCase } from "@api/notification/use-cases/mark-notification-read.use-case";
import { Notification, NotificationPage } from "@domain/notification/notification.model";
import { SnackbarService } from "@domain/shared/snackbar.service";
import { fail, ok, Result } from "@domain/shared/result.type";
import { of, Subject } from "rxjs";
import { NotificationService } from "./notification.service";

describe("NotificationService", () => {
  let service: NotificationService;
  let getNotifications: { execute: ReturnType<typeof vi.fn> };
  let getUnreadCount: { execute: ReturnType<typeof vi.fn> };
  let markRead: { execute: ReturnType<typeof vi.fn> };
  let markAllRead: { execute: ReturnType<typeof vi.fn> };
  let router: { navigateByUrl: ReturnType<typeof vi.fn> };
  let snackbar: { error: ReturnType<typeof vi.fn> };

  const first: Notification = {
    id: 1,
    type: "program_news_published",
    category: "program",
    title: "Новая новость",
    message: "Опубликована новость программы",
    actionUrl: "/office/program/5",
    readAt: null,
    createdAt: "2026-09-12T08:00:00Z",
    actor: null,
  };
  const second: Notification = {
    ...first,
    id: 2,
    type: "program_material_published",
    title: "Новый материал",
    readAt: "2026-09-12T09:00:00Z",
  };
  const third: Notification = {
    ...first,
    id: 3,
    type: "course_access_opened",
    title: "Открыт курс",
    actionUrl: "/office/courses/9",
  };

  function page(
    results: Notification[],
    count = results.length,
    unreadCount = results.filter(item => !item.readAt).length,
  ): NotificationPage {
    return { count, unreadCount, next: null, previous: null, results };
  }

  beforeEach(() => {
    getNotifications = { execute: vi.fn().mockReturnValue(of(ok(page([first, second])))) };
    getUnreadCount = { execute: vi.fn().mockReturnValue(of(ok(1))) };
    markRead = {
      execute: vi.fn().mockReturnValue(of(ok({ ...first, readAt: "2026-09-12T10:00:00Z" }))),
    };
    markAllRead = {
      execute: vi.fn().mockReturnValue(of(ok({ updated: 1, unreadCount: 0 }))),
    };
    router = { navigateByUrl: vi.fn().mockResolvedValue(true) };
    snackbar = { error: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        NotificationService,
        { provide: GetNotificationsUseCase, useValue: getNotifications },
        { provide: GetNotificationUnreadCountUseCase, useValue: getUnreadCount },
        { provide: MarkNotificationReadUseCase, useValue: markRead },
        { provide: MarkAllNotificationsReadUseCase, useValue: markAllRead },
        { provide: Router, useValue: router },
        { provide: SnackbarService, useValue: snackbar },
      ],
    });
    service = TestBed.inject(NotificationService);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("init загружает первую страницу и отдельный unread count только один раз", () => {
    service.initialize();
    service.initialize();

    expect(getNotifications.execute).toHaveBeenCalledExactlyOnceWith({ limit: 20, offset: 0 });
    expect(getUnreadCount.execute).toHaveBeenCalledTimes(1);
    expect(service.notifications()).toEqual([first, second]);
    expect(service.unreadCount()).toBe(1);
  });

  it("раз в 60 секунд poll-ит только unread count без параллельного storm", () => {
    vi.useFakeTimers();
    const pending = new Subject<
      Result<number, { kind: "get_notification_unread_count_error"; cause: unknown }>
    >();
    getUnreadCount.execute.mockReturnValue(pending);

    service.initialize();
    vi.advanceTimersByTime(60_000);
    expect(getUnreadCount.execute).toHaveBeenCalledTimes(1);
    expect(getNotifications.execute).toHaveBeenCalledTimes(1);

    pending.next(ok(4));
    pending.complete();
    vi.advanceTimersByTime(60_000);
    expect(getUnreadCount.execute).toHaveBeenCalledTimes(2);
    expect(getNotifications.execute).toHaveBeenCalledTimes(1);
  });

  it("обновляет unread count при возвращении вкладки в visible", () => {
    vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible");
    service.initialize();

    document.dispatchEvent(new Event("visibilitychange"));

    expect(getUnreadCount.execute).toHaveBeenCalledTimes(2);
    expect(getNotifications.execute).toHaveBeenCalledTimes(1);
  });

  it("открытие popup заменяет первую страницу без дублей", () => {
    service.initialize();
    getNotifications.execute.mockReturnValue(of(ok(page([third, { ...third }], 1, 1))));

    service.onPopupOpenChange(true);

    expect(service.notifications()).toEqual([third]);
    expect(getNotifications.execute).toHaveBeenCalledTimes(2);
    expect(getUnreadCount.execute).toHaveBeenCalledTimes(2);
  });

  it("loadMore использует loaded offset и append без duplicate id", () => {
    getNotifications.execute.mockReturnValueOnce(of(ok(page([first, second], 3, 2))));
    service.initialize();
    getNotifications.execute.mockReturnValueOnce(of(ok(page([second, third], 3, 2))));

    service.loadMore();

    expect(getNotifications.execute).toHaveBeenLastCalledWith({ limit: 20, offset: 2 });
    expect(service.notifications().map(item => item.id)).toEqual([1, 2, 3]);
    expect(service.hasMore()).toBe(false);
  });

  it("mark read уменьшает count один раз и повторно не вызывает POST", () => {
    service.initialize();

    service.openNotification(first);
    service.openNotification(service.notifications()[0]);

    expect(markRead.execute).toHaveBeenCalledExactlyOnceWith(1);
    expect(service.unreadCount()).toBe(0);
    expect(service.notifications()[0].readAt).toBe("2026-09-12T10:00:00Z");
    expect(router.navigateByUrl).toHaveBeenCalledTimes(2);
  });

  it("не отправляет параллельные mark read для одного notification id", () => {
    const pending = new Subject<
      Result<Notification, { kind: "mark_notification_read_error"; cause: unknown }>
    >();
    markRead.execute.mockReturnValue(pending);
    service.initialize();

    service.openNotification(first);
    service.openNotification(first);

    expect(markRead.execute).toHaveBeenCalledTimes(1);
    pending.next(ok({ ...first, readAt: "2026-09-12T10:00:00Z" }));
    pending.complete();
  });

  it("mark all обнуляет badge и локально отмечает загруженные элементы", () => {
    service.initialize();

    service.markAllRead();

    expect(service.unreadCount()).toBe(0);
    expect(service.notifications().every(item => item.readAt !== null)).toBe(true);
    expect(markAllRead.execute).toHaveBeenCalledTimes(1);
  });

  it("ошибка refresh не уничтожает существующий state", () => {
    service.initialize();
    getNotifications.execute.mockReturnValue(
      of(fail({ kind: "get_notifications_error" as const, cause: new Error("offline") })),
    );

    service.refreshFirstPage();

    expect(service.notifications()).toEqual([first, second]);
    expect(service.error()).toBe("Не удалось загрузить уведомления");
  });

  it("ошибка read-all сохраняет локальный count и показывает snackbar", () => {
    markAllRead.execute.mockReturnValue(
      of(
        fail({
          kind: "mark_all_notifications_read_error" as const,
          cause: new Error("offline"),
        }),
      ),
    );
    service.initialize();

    service.markAllRead();

    expect(service.unreadCount()).toBe(1);
    expect(snackbar.error).toHaveBeenCalledWith("Не удалось прочитать все уведомления");
  });

  it("не переходит по invalid actionUrl, но отмечает notification прочитанным", () => {
    const unsafe = { ...first, actionUrl: "https://evil.example" };
    getNotifications.execute.mockReturnValue(of(ok(page([unsafe], 1, 1))));
    markRead.execute.mockReturnValue(of(ok({ ...unsafe, readAt: "2026-09-12T10:00:00Z" })));
    service.initialize();

    service.openNotification(unsafe);

    expect(markRead.execute).toHaveBeenCalledWith(1);
    expect(service.unreadCount()).toBe(0);
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it("poll и visibility используют только unread endpoint без request storm", () => {
    vi.useFakeTimers();
    const pending = new Subject<
      Result<number, { kind: "get_notification_unread_count_error"; cause: unknown }>
    >();
    getUnreadCount.execute.mockReturnValue(pending);
    service.initialize();

    vi.advanceTimersByTime(60_000);
    document.dispatchEvent(new Event("visibilitychange"));
    expect(getUnreadCount.execute).toHaveBeenCalledTimes(1);
    expect(getNotifications.execute).toHaveBeenCalledTimes(1);

    pending.next(ok(4));
    pending.complete();
    vi.advanceTimersByTime(60_000);
    expect(getUnreadCount.execute).toHaveBeenCalledTimes(2);
  });
});
