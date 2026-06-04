/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { FetchProfileNewsUseCase } from "./fetch-profile-news.use-case";
import {
  NewsRepositoryPort,
  PROFILE_NEWS_REPOSITORY,
} from "@domain/news/port/news.repository.port";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { ProfileNews } from "@domain/profile/profile-news.model";

describe("FetchProfileNewsUseCase", () => {
  let useCase: FetchProfileNewsUseCase;
  let repo: any;

  function setup(): void {
    repo = { fetchNews: vi.fn() };
    TestBed.configureTestingModule({
      providers: [FetchProfileNewsUseCase, { provide: PROFILE_NEWS_REPOSITORY, useValue: repo }],
    });
    useCase = TestBed.inject(FetchProfileNewsUseCase);
  }

  const page: ApiPagination<ProfileNews> = {
    count: 0,
    results: [],
    next: "",
    previous: "",
  };

  it("делегирует userId в репозиторий", () => {
    setup();
    repo.fetchNews.mockReturnValue(of(page));

    useCase.execute(42).subscribe();

    expect(repo.fetchNews).toHaveBeenCalledExactlyOnceWith("42");
  });

  it("при успехе возвращает ok со страницей новостей", () =>
    new Promise<void>(done => {
      setup();
      repo.fetchNews.mockReturnValue(of(page));

      useCase.execute(42).subscribe(result => {
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.value).toBe(page);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'fetch_profile_news_error' } с cause", () =>
    new Promise<void>(done => {
      setup();
      const boom = new Error("boom");
      repo.fetchNews.mockReturnValue(throwError(() => boom));

      useCase.execute(42).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.kind).toBe("fetch_profile_news_error");
          expect(result.error.cause).toBe(boom);
        }
        done();
      });
    }));
});
