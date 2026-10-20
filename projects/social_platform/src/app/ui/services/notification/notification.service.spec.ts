/** @format */

import { TestBed } from "@angular/core/testing";
import { ApiService, TokenService } from "@corelib";
import { EventBus } from "@domain/shared/event-bus";
import { of, Subject } from "rxjs";
import { Notification } from "@domain/other/notification.model";

import { NotificationService } from "./notification.service";

describe("NotificationService", () => {
  let service: NotificationService;

  const api = { get: vi.fn(), post: vi.fn() };
  beforeEach(() => {
    vi.useFakeTimers();
    api.get.mockReset().mockReturnValue(of({ results: [], unreadCount: 0 }));
    api.post.mockReset();
    TestBed.configureTestingModule({
      providers: [
        { provide: ApiService, useValue: api },
        { provide: TokenService, useValue: { getTokens: () => ({ access: "test" }) } },
      ],
    });
    service = TestBed.inject(NotificationService);
  });
  afterEach(() => {
    service.stop();
    vi.useRealTimers();
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
  it("загружает сохраненные уведомления и отмечает конкретное прочитанным на сервере", async () => {
    const notice = {
      id: "expert_joined:4",
      kind: "expert_joined",
      text: "Эксперт присоединился",
      readAt: null,
      programId: 2,
      createdAt: "2026-10-19T12:00:00Z",
    } as Notification;
    api.get.mockReturnValue(of({ results: [notice], unreadCount: 1 }));
    api.post.mockReturnValue(
      of({ id: "expert_joined:4", readAt: "2026-10-19T12:01:00Z", unreadCount: 0 }),
    );
    service.start();
    await vi.advanceTimersByTimeAsync(1);
    expect(service.notifications.value).toEqual([notice]);
    service.read(notice);
    expect(api.get).toHaveBeenCalledWith("/core/notifications/");
    expect(api.post).toHaveBeenCalledWith("/core/notifications/expert_joined:4/read/", {});
    expect(service.notifications.value[0].readAt).toBeTruthy();
  });
  it("читает административный запрос и использует общий счетчик сервера", async () => {
    const notice = {
      id: "registration_connection:4",
      kind: "registration_connection",
      text: "Запрос на подключение сайта",
      readAt: null,
      programId: 2,
      registrationId: 6,
      createdAt: "2026-10-20T12:00:00Z",
    } as Notification;
    api.get.mockReturnValue(of({ results: [notice], unreadCount: 7 }));
    api.post.mockReturnValue(of({ id: notice.id, readAt: "2026-10-20T12:01:00Z", unreadCount: 3 }));
    let unread = 0;
    const subscription = service.hasNotifications.subscribe(value => (unread = value));
    service.start();
    await vi.advanceTimersByTimeAsync(1);
    service.read(notice);
    expect(api.post).toHaveBeenCalledWith(
      "/core/notifications/registration_connection:4/read/",
      {},
    );
    expect(service.notifications.value[0].readAt).toBeTruthy();
    expect(unread).toBe(3);
    subscription.unsubscribe();
  });
  it("выход отменяет запрос и очищает данные предыдущего пользователя", async () => {
    const response = new Subject();
    api.get.mockReturnValue(response);
    service.start();
    await vi.advanceTimersByTimeAsync(1);
    TestBed.inject(EventBus).emit({ type: "LoggedOut", payload: {}, occurredAt: new Date() });
    response.next({ results: [{ id: 9 }], unreadCount: 1 });
    expect(service.notifications.value).toEqual([]);
    await vi.advanceTimersByTimeAsync(31_000);
    expect(api.get).toHaveBeenCalledTimes(1);
  });
});
