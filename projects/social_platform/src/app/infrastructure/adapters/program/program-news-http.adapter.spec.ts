/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { ApiService } from "@corelib";
import { ProgramNewsHttpAdapter } from "./program-news-http.adapter";
import { FeedNews } from "@domain/news/project-news.model";

describe("ProgramNewsHttpAdapter", () => {
  let adapter: ProgramNewsHttpAdapter;
  let api: any;

  function setup(): void {
    api = { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() };
    TestBed.configureTestingModule({
      providers: [ProgramNewsHttpAdapter, { provide: ApiService, useValue: api }],
    });
    adapter = TestBed.inject(ProgramNewsHttpAdapter);
  }

  it("fetchNews идёт в GET /programs/:id/news/ c limit/offset", () => {
    setup();
    api.get.mockReturnValue(of({ count: 0, results: [], next: "", previous: "" }));

    adapter.fetchNews(5, 10, 20).subscribe();

    const [url, params] = api.get.mock.lastCall;
    expect(url).toBe("/programs/5/news/");
    expect(params?.get("limit")).toBe("10");
    expect(params?.get("offset")).toBe("20");
  });

  it("setNewsViewed идёт в POST /programs/:pid/news/:nid/set_viewed/", () => {
    setup();
    api.post.mockReturnValue(of(undefined));

    adapter.setNewsViewed("5", 9).subscribe();

    expect(api.post).toHaveBeenCalledExactlyOnceWith("/programs/5/news/9/set_viewed/", {});
  });

  it("toggleLike идёт в POST /programs/:pid/news/:nid/set_liked/ c is_liked", () => {
    setup();
    api.post.mockReturnValue(of(undefined));

    adapter.toggleLike("5", 9, true).subscribe();

    expect(api.post).toHaveBeenCalledExactlyOnceWith("/programs/5/news/9/set_liked/", {
      is_liked: true,
    });
  });

  it("addNews идёт в POST /programs/:id/news/ с body", () => {
    setup();
    api.post.mockReturnValue(of({} as FeedNews));
    const body = { text: "t", files: ["f"] };

    adapter.addNews(5, body).subscribe();

    expect(api.post).toHaveBeenCalledExactlyOnceWith("/programs/5/news/", body);
  });

  it("editNews идёт в PATCH /programs/:pid/news/:nid c частичными данными", () => {
    setup();
    api.patch.mockReturnValue(of({} as FeedNews));
    const patch = { text: "new" };

    adapter.editNews(5, 9, patch).subscribe();

    expect(api.patch).toHaveBeenCalledExactlyOnceWith("/programs/5/news/9/", patch);
  });

  it("deleteNews идёт в DELETE /programs/:pid/news/:nid", () => {
    setup();
    api.delete.mockReturnValue(of(undefined));

    adapter.deleteNews(5, 9).subscribe();

    expect(api.delete).toHaveBeenCalledExactlyOnceWith("/programs/5/news/9/");
  });
});
