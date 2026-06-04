/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { ApiService } from "@corelib";
import { ProfileNewsHttpAdapter } from "./profile-news-http.adapter";
import { ProfileNews } from "@domain/profile/profile-news.model";

describe("ProfileNewsHttpAdapter", () => {
  let adapter: ProfileNewsHttpAdapter;
  let api: any;

  function setup(): void {
    api = { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() };
    TestBed.configureTestingModule({
      providers: [ProfileNewsHttpAdapter, { provide: ApiService, useValue: api }],
    });
    adapter = TestBed.inject(ProfileNewsHttpAdapter);
  }

  it("fetchNews идёт в GET /auth/users/:id/news/ c limit=10", () => {
    setup();
    api.get.mockReturnValue(of({ count: 0, results: [], next: "", previous: "" }));

    adapter.fetchNews("7").subscribe();

    const [url, params] = api.get.mock.lastCall;
    expect(url).toBe("/auth/users/7/news/");
    expect(params?.get("limit")).toBe("10");
  });

  it("fetchNewsDetail идёт в GET /auth/users/:uid/news/:nid", () => {
    setup();
    api.get.mockReturnValue(of({} as ProfileNews));

    adapter.fetchNewsDetail("7", "9").subscribe();

    expect(api.get).toHaveBeenCalledExactlyOnceWith("/auth/users/7/news/9/");
  });

  it("addNews идёт в POST /auth/users/:id/news/ с body", () => {
    setup();
    api.post.mockReturnValue(of({} as ProfileNews));
    const obj = { text: "t", files: ["f"] };

    adapter.addNews("7", obj).subscribe();

    expect(api.post).toHaveBeenCalledExactlyOnceWith("/auth/users/7/news/", obj);
  });

  it("setNewsViewed идёт в POST /auth/users/:uid/news/:nid/set_viewed/", () => {
    setup();
    api.post.mockReturnValue(of(undefined));

    adapter.setNewsViewed(7, 9).subscribe();

    expect(api.post).toHaveBeenCalledExactlyOnceWith("/auth/users/7/news/9/set_viewed/", {});
  });

  it("deleteNews идёт в DELETE /auth/users/:uid/news/:nid/", () => {
    setup();
    api.delete.mockReturnValue(of(undefined));

    adapter.deleteNews("7", 9).subscribe();

    expect(api.delete).toHaveBeenCalledExactlyOnceWith("/auth/users/7/news/9/");
  });

  it("toggleLike идёт в POST /auth/users/:uid/news/:nid/set_liked/ c is_liked", () => {
    setup();
    api.post.mockReturnValue(of(undefined));

    adapter.toggleLike("7", 9, true).subscribe();

    expect(api.post).toHaveBeenCalledExactlyOnceWith("/auth/users/7/news/9/set_liked/", {
      is_liked: true,
    });
  });

  it("editNews идёт в PATCH /auth/users/:uid/news/:nid/ c частичными данными", () => {
    setup();
    api.patch.mockReturnValue(of({} as ProfileNews));
    const patch = { text: "new" };

    adapter.editNews("7", 9, patch).subscribe();

    expect(api.patch).toHaveBeenCalledExactlyOnceWith("/auth/users/7/news/9/", patch);
  });
});
