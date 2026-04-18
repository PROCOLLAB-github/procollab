/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { ApiService } from "@corelib";
import { ChatHttpAdapter } from "./chat-http.adapter";

describe("ChatHttpAdapter", () => {
  let adapter: ChatHttpAdapter;
  let api: jasmine.SpyObj<ApiService>;

  function setup(): void {
    api = jasmine.createSpyObj<ApiService>("ApiService", ["get"]);
    TestBed.configureTestingModule({
      providers: [ChatHttpAdapter, { provide: ApiService, useValue: api }],
    });
    adapter = TestBed.inject(ChatHttpAdapter);
  }

  it("loadMessages идёт в GET /chats/projects/:id/messages/ c offset/limit", () => {
    setup();
    api.get.and.returnValue(of({ count: 0, results: [], next: "", previous: "" }));

    adapter.loadMessages(42, 20, 10).subscribe();

    const [url, params] = api.get.calls.mostRecent().args;
    expect(url).toBe("/chats/projects/42/messages/");
    expect(params?.get("offset")).toBe("20");
    expect(params?.get("limit")).toBe("10");
  });

  it("loadMessages не добавляет параметры если offset/limit не переданы", () => {
    setup();
    api.get.and.returnValue(of({ count: 0, results: [], next: "", previous: "" }));

    adapter.loadMessages(42).subscribe();

    const params = api.get.calls.mostRecent().args[1];
    expect(params?.has("offset")).toBeFalse();
    expect(params?.has("limit")).toBeFalse();
  });

  it("loadProjectFiles идёт в GET /chats/projects/:id/files", () => {
    setup();
    api.get.and.returnValue(of([]));

    adapter.loadProjectFiles(42).subscribe();

    expect(api.get).toHaveBeenCalledOnceWith("/chats/projects/42/files");
  });

  it("hasUnreads идёт в GET /chats/has-unreads", () => {
    setup();
    api.get.and.returnValue(of({ hasUnreads: true }));

    adapter.hasUnreads().subscribe();

    expect(api.get).toHaveBeenCalledOnceWith("/chats/has-unreads");
  });
});
