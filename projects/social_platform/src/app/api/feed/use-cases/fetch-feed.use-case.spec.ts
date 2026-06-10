/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { FetchFeedUseCase } from "./fetch-feed.use-case";
import { FeedRepositoryPort } from "@domain/feed/ports/feed.repository.port";
import { FeedItem } from "@domain/feed/feed-item.model";
import { ApiPagination } from "@domain/other/api-pagination.model";

describe("FetchFeedUseCase", () => {
  let useCase: FetchFeedUseCase;
  let repo: any;

  const page: ApiPagination<FeedItem> = { count: 0, results: [], next: "", previous: "" };

  function setup(): void {
    repo = { fetchFeed: vi.fn() };
    TestBed.configureTestingModule({
      providers: [FetchFeedUseCase, { provide: FeedRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(FetchFeedUseCase);
  }

  it("делегирует offset/limit/type в репозиторий", () => {
    setup();
    repo.fetchFeed.mockReturnValue(of(page));

    useCase.execute(0, 10, "all").subscribe();

    expect(repo.fetchFeed).toHaveBeenCalledExactlyOnceWith(0, 10, "all");
  });

  it("при успехе возвращает ok со страницей", () =>
    new Promise<void>(done => {
      setup();
      repo.fetchFeed.mockReturnValue(of(page));

      useCase.execute(0, 10, "all").subscribe(result => {
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.value).toBe(page);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'fetch_feed_error' } с cause", () =>
    new Promise<void>(done => {
      setup();
      const boom = new Error("boom");
      repo.fetchFeed.mockReturnValue(throwError(() => boom));

      useCase.execute(0, 10, "all").subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.kind).toBe("fetch_feed_error");
          expect(result.error.cause).toBe(boom);
        }
        done();
      });
    }));
});
