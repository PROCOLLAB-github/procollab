/** @format */

import { TestBed } from "@angular/core/testing";
import { ApiService } from "@corelib";
import { of } from "rxjs";
import { NotificationHttpAdapter } from "./notification-http.adapter";
import { NotificationDto, NotificationPageDto } from "./dto/notification.dto";

describe("NotificationHttpAdapter", () => {
  let adapter: NotificationHttpAdapter;
  let api: { get: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn> };

  const dto: NotificationDto = {
    id: 1,
    type: "program_news_published",
    category: "program",
    title: "Новая новость",
    message: "Опубликована новость",
    actionUrl: "/office/program/5",
    readAt: null,
    createdAt: "2026-09-12T08:00:00Z",
    actor: null,
  };

  beforeEach(() => {
    api = { get: vi.fn(), post: vi.fn() };
    TestBed.configureTestingModule({
      providers: [NotificationHttpAdapter, { provide: ApiService, useValue: api }],
    });
    adapter = TestBed.inject(NotificationHttpAdapter);
  });

  it("передаёт limit/offset/unread в GET /notifications/", () => {
    const page: NotificationPageDto = {
      count: 1,
      unreadCount: 1,
      next: null,
      previous: null,
      results: [dto],
    };
    api.get.mockReturnValue(of(page));

    adapter.getNotifications({ limit: 20, offset: 40, unread: true }).subscribe();

    const [url, params] = api.get.mock.lastCall;
    expect(url).toBe("/notifications/");
    expect(params.get("limit")).toBe("20");
    expect(params.get("offset")).toBe("40");
    expect(params.get("unread")).toBe("true");
  });

  it("не добавляет unread, если фильтр не задан", () => {
    api.get.mockReturnValue(
      of({ count: 0, unreadCount: 0, next: null, previous: null, results: [] }),
    );

    adapter.getNotifications({ limit: 20, offset: 0 }).subscribe();

    expect(api.get.mock.lastCall[1].has("unread")).toBe(false);
  });

  it("получает отдельный unread count", () => {
    api.get.mockReturnValue(of({ unreadCount: 3 }));

    adapter.getUnreadCount().subscribe();

    expect(api.get).toHaveBeenCalledExactlyOnceWith("/notifications/unread-count/");
  });

  it("отмечает одно уведомление прочитанным", () => {
    api.post.mockReturnValue(of({ ...dto, readAt: "2026-09-12T09:00:00Z" }));

    adapter.markRead(17).subscribe();

    expect(api.post).toHaveBeenCalledExactlyOnceWith("/notifications/17/read/", {});
  });

  it("отмечает все уведомления прочитанными", () => {
    api.post.mockReturnValue(of({ updated: 3, unreadCount: 0 }));

    adapter.markAllRead().subscribe();

    expect(api.post).toHaveBeenCalledExactlyOnceWith("/notifications/read-all/", {});
  });
});
