/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { ApiService } from "@corelib";
import { ProjectNewsHttpAdapter } from "./project-news-http.adapter";
import { FeedNews } from "@domain/news/project-news.model";

describe("ProjectNewsHttpAdapter", () => {
  let adapter: ProjectNewsHttpAdapter;
  let api: any;

  function setup(): void {
    api = { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() };
    TestBed.configureTestingModule({
      providers: [ProjectNewsHttpAdapter, { provide: ApiService, useValue: api }],
    });
    adapter = TestBed.inject(ProjectNewsHttpAdapter);
  }

  it("fetchNews идёт в GET /projects/:id/news/ c limit=100", () => {
    setup();
    api.get.mockReturnValue(of({ count: 0, results: [], next: "", previous: "" }));

    adapter.fetchNews("42").subscribe();

    const [url, params] = api.get.mock.lastCall;
    expect(url).toBe("/projects/42/news/");
    expect(params?.get("limit")).toBe("100");
  });

  it("fetchNewsDetail идёт в GET /projects/:pid/news/:nid", () => {
    setup();
    api.get.mockReturnValue(of({} as FeedNews));

    adapter.fetchNewsDetail("42", "9").subscribe();

    expect(api.get).toHaveBeenCalledExactlyOnceWith("/projects/42/news/9/");
  });

  it("addNews идёт в POST /projects/:id/news/ с body", () => {
    setup();
    api.post.mockReturnValue(of({} as FeedNews));
    const body = { text: "t", files: ["f"] };

    adapter.addNews("42", body).subscribe();

    expect(api.post).toHaveBeenCalledExactlyOnceWith("/projects/42/news/", body);
  });

  it("setNewsViewed идёт в POST /projects/:pid/news/:nid/set_viewed/", () => {
    setup();
    api.post.mockReturnValue(of(undefined));

    adapter.setNewsViewed(42, 9).subscribe();

    expect(api.post).toHaveBeenCalledExactlyOnceWith("/projects/42/news/9/set_viewed/", {});
  });

  it("deleteNews идёт в DELETE /projects/:pid/news/:nid/", () => {
    setup();
    api.delete.mockReturnValue(of(undefined));

    adapter.deleteNews("42", 9).subscribe();

    expect(api.delete).toHaveBeenCalledExactlyOnceWith("/projects/42/news/9/");
  });

  it("toggleLike идёт в POST /projects/:pid/news/:nid/set_liked/ c is_liked", () => {
    setup();
    api.post.mockReturnValue(of(undefined));

    adapter.toggleLike("42", 9, true).subscribe();

    expect(api.post).toHaveBeenCalledExactlyOnceWith("/projects/42/news/9/set_liked/", {
      is_liked: true,
    });
  });

  it("editNews идёт в PATCH /projects/:pid/news/:nid/ c частичными данными", () => {
    setup();
    api.patch.mockReturnValue(of({} as FeedNews));
    const patch = { text: "new" };

    adapter.editNews("42", 9, patch).subscribe();

    expect(api.patch).toHaveBeenCalledExactlyOnceWith("/projects/42/news/9/", patch);
  });
});
