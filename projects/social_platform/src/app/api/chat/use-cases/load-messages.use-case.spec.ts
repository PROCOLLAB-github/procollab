/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { LoadMessagesUseCase } from "./load-messages.use-case";
import { ChatRepositoryPort } from "@domain/chat/ports/chat.repository.port";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { ChatMessage } from "@domain/chat/chat-message.model";

describe("LoadMessagesUseCase", () => {
  let useCase: LoadMessagesUseCase;
  let repo: any;

  function setup(): void {
    repo = { loadMessages: vi.fn() };
    TestBed.configureTestingModule({
      providers: [LoadMessagesUseCase, { provide: ChatRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(LoadMessagesUseCase);
  }

  const page: ApiPagination<ChatMessage> = {
    count: 0,
    results: [],
    next: "",
    previous: "",
  };

  it("делегирует projectId, offset, limit в репозиторий", () => {
    setup();
    repo.loadMessages.mockReturnValue(of(page));

    useCase.execute(1, "directs", 10, 20).subscribe();

    expect(repo.loadMessages).toHaveBeenCalledExactlyOnceWith(1, "directs", 10, 20);
  });

  it("при успехе возвращает ok со страницей сообщений", () =>
    new Promise<void>(done => {
      setup();
      repo.loadMessages.mockReturnValue(of(page));

      useCase.execute(1, "directs").subscribe(result => {
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.value).toBe(page);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'server_error' }", () =>
    new Promise<void>(done => {
      setup();
      repo.loadMessages.mockReturnValue(throwError(() => new Error("boom")));

      useCase.execute(1, "directs").subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.error.kind).toBe("server_error");
        done();
      });
    }));
});
