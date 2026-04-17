/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { FetchFeedUseCase } from "./fetch-feed.use-case";
import { FeedRepositoryPort } from "@domain/feed/ports/feed.repository.port";
import { FeedItem } from "@domain/feed/feed-item.model";
import { ApiPagination } from "@domain/other/api-pagination.model";

describe("FetchFeedUseCase", () => {
  let useCase: FetchFeedUseCase;
  let repo: jasmine.SpyObj<FeedRepositoryPort>;

  const page: ApiPagination<FeedItem> = { count: 0, results: [], next: "", previous: "" };

  function setup(): void {
    repo = jasmine.createSpyObj<FeedRepositoryPort>("FeedRepositoryPort", ["fetchFeed"]);
    TestBed.configureTestingModule({
      providers: [FetchFeedUseCase, { provide: FeedRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(FetchFeedUseCase);
  }

  it("делегирует offset/limit/type в репозиторий", () => {
    setup();
    repo.fetchFeed.and.returnValue(of(page));

    useCase.execute(0, 10, "all").subscribe();

    expect(repo.fetchFeed).toHaveBeenCalledOnceWith(0, 10, "all");
  });

  it("при успехе возвращает ok со страницей", done => {
    setup();
    repo.fetchFeed.and.returnValue(of(page));

    useCase.execute(0, 10, "all").subscribe(result => {
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe(page);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'fetch_feed_error' } с cause", done => {
    setup();
    const boom = new Error("boom");
    repo.fetchFeed.and.returnValue(throwError(() => boom));

    useCase.execute(0, 10, "all").subscribe(result => {
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe("fetch_feed_error");
        expect(result.error.cause).toBe(boom);
      }
      done();
    });
  });
});
