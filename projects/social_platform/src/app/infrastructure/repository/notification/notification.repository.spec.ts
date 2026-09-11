/** @format */

import { TestBed } from "@angular/core/testing";
import { firstValueFrom, of } from "rxjs";
import { NotificationHttpAdapter } from "../../adapters/notification/notification-http.adapter";
import { NotificationRepository } from "./notification.repository";

describe("NotificationRepository", () => {
  let repository: NotificationRepository;
  let adapter: {
    getNotifications: ReturnType<typeof vi.fn>;
    getUnreadCount: ReturnType<typeof vi.fn>;
    markRead: ReturnType<typeof vi.fn>;
    markAllRead: ReturnType<typeof vi.fn>;
  };

  const dto = {
    id: 4,
    type: "future_backend_type",
    category: "future_category",
    title: "Заголовок",
    message: "Текст",
    actionUrl: "/office/program/12",
    readAt: null,
    createdAt: "2026-09-12T08:00:00Z",
    actor: {
      id: 7,
      firstName: "Анна",
      lastName: "Иванова",
      avatar: null,
    },
  };

  beforeEach(() => {
    adapter = {
      getNotifications: vi.fn(),
      getUnreadCount: vi.fn(),
      markRead: vi.fn(),
      markAllRead: vi.fn(),
    };
    TestBed.configureTestingModule({
      providers: [NotificationRepository, { provide: NotificationHttpAdapter, useValue: adapter }],
    });
    repository = TestBed.inject(NotificationRepository);
  });

  it("мапит page DTO и сохраняет defensive unknown type", async () => {
    adapter.getNotifications.mockReturnValue(
      of({ count: 1, unreadCount: 1, next: null, previous: null, results: [dto] }),
    );

    const page = await firstValueFrom(repository.getNotifications({ limit: 20, offset: 0 }));

    expect(page).toEqual({
      count: 1,
      unreadCount: 1,
      next: null,
      previous: null,
      results: [dto],
    });
  });

  it("разворачивает unreadCount из DTO", async () => {
    adapter.getUnreadCount.mockReturnValue(of({ unreadCount: 6 }));

    await expect(firstValueFrom(repository.getUnreadCount())).resolves.toBe(6);
  });

  it("мапит mark-read и mark-all ответы", async () => {
    adapter.markRead.mockReturnValue(of({ ...dto, readAt: "2026-09-12T09:00:00Z" }));
    adapter.markAllRead.mockReturnValue(of({ updated: 2, unreadCount: 0 }));

    await expect(firstValueFrom(repository.markRead(4))).resolves.toMatchObject({
      id: 4,
      readAt: "2026-09-12T09:00:00Z",
    });
    await expect(firstValueFrom(repository.markAllRead())).resolves.toEqual({
      updated: 2,
      unreadCount: 0,
    });
  });
});
