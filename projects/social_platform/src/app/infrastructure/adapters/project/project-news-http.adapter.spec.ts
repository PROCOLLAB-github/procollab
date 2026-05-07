/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { ApiService } from "@corelib";
import { ProjectNewsHttpAdapter } from "./project-news-http.adapter";
import { FeedNews } from "@domain/project/project-news.model";

describe("ProjectNewsHttpAdapter", () => {
  let adapter: ProjectNewsHttpAdapter;
  let api: jasmine.SpyObj<ApiService>;

  function setup(): void {
    api = jasmine.createSpyObj<ApiService>("ApiService", ["get", "post", "patch", "delete"]);
    TestBed.configureTestingModule({
      providers: [ProjectNewsHttpAdapter, { provide: ApiService, useValue: api }],
    });
    adapter = TestBed.inject(ProjectNewsHttpAdapter);
  }

  it("fetchNews идёт в GET /projects/:id/news/ c limit=100", () => {
    setup();
    api.get.and.returnValue(of({ count: 0, results: [], next: "", previous: "" }));

    adapter.fetchNews("42").subscribe();

    const [url, params] = api.get.calls.mostRecent().args;
    expect(url).toBe("/projects/42/news/");
    expect(params?.get("limit")).toBe("100");
  });

  it("fetchNewsDetail идёт в GET /projects/:pid/news/:nid", () => {
    setup();
    api.get.and.returnValue(of({} as FeedNews));

    adapter.fetchNewsDetail("42", "9").subscribe();

    expect(api.get).toHaveBeenCalledOnceWith("/projects/42/news/9");
  });

  it("addNews идёт в POST /projects/:id/news/ с body", () => {
    setup();
    api.post.and.returnValue(of({} as FeedNews));
    const body = { text: "t", files: ["f"] };

    adapter.addNews("42", body).subscribe();

    expect(api.post).toHaveBeenCalledOnceWith("/projects/42/news/", body);
  });

  it("setNewsViewed идёт в POST /projects/:pid/news/:nid/set_viewed/", () => {
    setup();
    api.post.and.returnValue(of(undefined));

    adapter.setNewsViewed(42, 9).subscribe();

    expect(api.post).toHaveBeenCalledOnceWith("/projects/42/news/9/set_viewed/", {});
  });

  it("deleteNews идёт в DELETE /projects/:pid/news/:nid/", () => {
    setup();
    api.delete.and.returnValue(of(undefined));

    adapter.deleteNews("42", 9).subscribe();

    expect(api.delete).toHaveBeenCalledOnceWith("/projects/42/news/9/");
  });

  it("toggleLike идёт в POST /projects/:pid/news/:nid/set_liked/ c is_liked", () => {
    setup();
    api.post.and.returnValue(of(undefined));

    adapter.toggleLike("42", 9, true).subscribe();

    expect(api.post).toHaveBeenCalledOnceWith("/projects/42/news/9/set_liked/", {
      is_liked: true,
    });
  });

  it("editNews идёт в PATCH /projects/:pid/news/:nid/ c частичными данными", () => {
    setup();
    api.patch.and.returnValue(of({} as FeedNews));
    const patch = { text: "new" };

    adapter.editNews("42", 9, patch).subscribe();

    expect(api.patch).toHaveBeenCalledOnceWith("/projects/42/news/9/", patch);
  });
});
