/** @format */

import { TestBed } from "@angular/core/testing";
import { ChatStateService } from "./chat-state.service";

describe("ChatStateService", () => {
  let service: ChatStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChatStateService],
    });

    service = TestBed.inject(ChatStateService);
  });

  // Тест unread удалён: unread-состояние переехало в ChatUnreadStateService,
  // ChatStateService теперь отвечает только за онлайн-статусы пользователей.
  it("обновляет online status cache без потери предыдущих значений", () => {
    service.setOnlineStatus(1, true);
    service.setOnlineStatus(2, false);

    expect(service.userOnlineStatusCache.value).toEqual({
      1: true,
      2: false,
    });
  });
});
