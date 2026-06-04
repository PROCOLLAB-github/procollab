/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { ApiService } from "@corelib";
import { ChatHttpAdapter } from "./chat-http.adapter";

describe("ChatHttpAdapter", () => {
  let adapter: ChatHttpAdapter;
  let api: any;

  function setup(): void {
    api = { get: vi.fn() };
    TestBed.configureTestingModule({
      providers: [ChatHttpAdapter, { provide: ApiService, useValue: api }],
    });
    adapter = TestBed.inject(ChatHttpAdapter);
  }

  it("loadMessages идёт в GET /chats/projects/:id/messages/ c offset/limit", () => {
    setup();
    api.get.mockReturnValue(of({ count: 0, results: [], next: "", previous: "" }));

    adapter.loadMessages(42, "projects", 20, 10).subscribe();

    const [url, params] = api.get.mock.lastCall;
    expect(url).toBe("/chats/projects/42/messages/");
    expect(params?.get("offset")).toBe("20");
    expect(params?.get("limit")).toBe("10");
  });

  it("loadMessages не добавляет параметры если offset/limit не переданы", () => {
    setup();
    api.get.mockReturnValue(of({ count: 0, results: [], next: "", previous: "" }));

    adapter.loadMessages(42, "projects").subscribe();

    const params = api.get.mock.lastCall[1];
    expect(params?.has("offset")).toBe(false);
    expect(params?.has("limit")).toBe(false);
  });

  it("loadProjectFiles идёт в GET /chats/projects/:id/files", () => {
    setup();
    api.get.mockReturnValue(of([]));

    adapter.loadProjectFiles(42).subscribe();

    expect(api.get).toHaveBeenCalledExactlyOnceWith("/chats/projects/42/files/");
  });

  it("hasUnreads идёт в GET /chats/has-unreads/", () => {
    setup();
    api.get.mockReturnValue(of({ hasUnreads: true }));

    adapter.hasUnreads().subscribe();

    expect(api.get).toHaveBeenCalledExactlyOnceWith("/chats/has-unreads/");
  });
});
