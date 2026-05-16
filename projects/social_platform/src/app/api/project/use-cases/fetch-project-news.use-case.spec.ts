/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { FetchProjectNewsUseCase } from "./fetch-project-news.use-case";
import {
  NewsRepositoryPort,
  PROJECT_NEWS_REPOSITORY,
} from "@domain/news/port/news.repository.port";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { FeedNews } from "@domain/news/project-news.model";

describe("FetchProjectNewsUseCase", () => {
  let useCase: FetchProjectNewsUseCase;
  let repo: jasmine.SpyObj<NewsRepositoryPort<any>>;

  function setup(): void {
    repo = jasmine.createSpyObj<NewsRepositoryPort<any>>("NewsRepositoryPort", ["fetchNews"]);
    TestBed.configureTestingModule({
      providers: [FetchProjectNewsUseCase, { provide: PROJECT_NEWS_REPOSITORY, useValue: repo }],
    });
    useCase = TestBed.inject(FetchProjectNewsUseCase);
  }

  const page: ApiPagination<FeedNews> = { count: 0, results: [], next: "", previous: "" };

  it("делегирует projectId в fetchNews", () => {
    setup();
    repo.fetchNews.and.returnValue(of(page));

    useCase.execute("p1").subscribe();

    expect(repo.fetchNews).toHaveBeenCalledOnceWith("p1");
  });

  it("при успехе возвращает ok с пагинацией", done => {
    setup();
    repo.fetchNews.and.returnValue(of(page));

    useCase.execute("p1").subscribe(result => {
      expect(result.ok).toBeTrue();
      if (result.ok) expect(result.value).toBe(page);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'fetch_project_news_error' } с cause", done => {
    setup();
    const err = new Error("boom");
    repo.fetchNews.and.returnValue(throwError(() => err));

    useCase.execute("p1").subscribe(result => {
      expect(result.ok).toBeFalse();
      if (!result.ok) {
        expect(result.error.kind).toBe("fetch_project_news_error");
        expect(result.error.cause).toBe(err);
      }
      done();
    });
  });
});
