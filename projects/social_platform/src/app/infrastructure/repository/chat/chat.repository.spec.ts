/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { ChatRepository } from "./chat.repository";
import { ChatHttpAdapter } from "../../adapters/chat/chat-http.adapter";

describe("ChatRepository", () => {
  let repository: ChatRepository;
  let adapter: jasmine.SpyObj<ChatHttpAdapter>;

  beforeEach(() => {
    adapter = jasmine.createSpyObj<ChatHttpAdapter>("ChatHttpAdapter", [
      "loadMessages",
      "loadProjectFiles",
      "hasUnreads",
    ]);

    adapter.loadMessages.and.returnValue(of({ count: 0, results: [], next: "", previous: "" }));
    adapter.loadProjectFiles.and.returnValue(of([]));
    adapter.hasUnreads.and.returnValue(of({ hasUnreads: true }));

    TestBed.configureTestingModule({
      providers: [ChatRepository, { provide: ChatHttpAdapter, useValue: adapter }],
    });

    repository = TestBed.inject(ChatRepository);
  });

  it("делегирует загрузку сообщений в HTTP adapter", () => {
    repository.loadMessages(42, 10, 20).subscribe();

    expect(adapter.loadMessages).toHaveBeenCalledOnceWith(42, 10, 20);
  });

  it("делегирует загрузку файлов проекта в HTTP adapter", () => {
    repository.loadProjectFiles(42).subscribe();

    expect(adapter.loadProjectFiles).toHaveBeenCalledOnceWith(42);
  });

  it("делегирует проверку unread в HTTP adapter", () => {
    repository.hasUnreads().subscribe();

    expect(adapter.hasUnreads).toHaveBeenCalledOnceWith();
  });
});
