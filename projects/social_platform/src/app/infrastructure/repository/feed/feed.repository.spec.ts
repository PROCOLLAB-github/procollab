/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { FeedRepository } from "./feed.repository";
import { FeedHttpAdapter } from "../../adapters/feed/feed-http.adapter";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { FeedItem } from "@domain/feed/feed-item.model";

describe("FeedRepository", () => {
  let repository: FeedRepository;
  let adapter: any;

  function setup(): void {
    adapter = { fetchFeed: vi.fn() };
    TestBed.configureTestingModule({
      providers: [FeedRepository, { provide: FeedHttpAdapter, useValue: adapter }],
    });
    repository = TestBed.inject(FeedRepository);
  }

  it("делегирует fetchFeed(offset, limit, type) в adapter", () => {
    setup();
    adapter.fetchFeed.mockReturnValue(
      of({ count: 0, results: [], next: "", previous: "" } as ApiPagination<FeedItem>),
    );

    repository.fetchFeed(0, 10, "all").subscribe();

    expect(adapter.fetchFeed).toHaveBeenCalledExactlyOnceWith(0, 10, "all");
  });
});
