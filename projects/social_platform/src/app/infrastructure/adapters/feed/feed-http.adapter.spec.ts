/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { ApiService } from "@corelib";
import { FeedHttpAdapter } from "./feed-http.adapter";

describe("FeedHttpAdapter", () => {
  let adapter: FeedHttpAdapter;
  let api: jasmine.SpyObj<ApiService>;

  function setup(): void {
    api = jasmine.createSpyObj<ApiService>("ApiService", ["get"]);
    TestBed.configureTestingModule({
      providers: [FeedHttpAdapter, { provide: ApiService, useValue: api }],
    });
    adapter = TestBed.inject(FeedHttpAdapter);
  }

  it("fetchFeed идёт в GET /feed/ c limit/offset/type", () => {
    setup();
    api.get.and.returnValue(of({ count: 0, results: [], next: "", previous: "" }));

    adapter.fetchFeed(20, 10, "vacancy|news").subscribe();

    const [url, params] = api.get.calls.mostRecent().args;
    expect(url).toBe("/feed/");
    expect(params?.get("limit")).toBe("10");
    expect(params?.get("offset")).toBe("20");
    expect(params?.get("type")).toBe("vacancy|news");
  });
});
