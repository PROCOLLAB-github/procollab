/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { GetProjectNewsDetailUseCase } from "./get-project-news-detail.use-case";
import {
  NewsRepositoryPort,
  PROJECT_NEWS_REPOSITORY,
} from "@domain/news/port/news.repository.port";
import { FeedNews } from "@domain/news/project-news.model";

describe("GetProjectNewsDetailUseCase", () => {
  let useCase: GetProjectNewsDetailUseCase;
  let repo: any;

  function setup(): void {
    repo = { fetchNewsDetail: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        GetProjectNewsDetailUseCase,
        { provide: PROJECT_NEWS_REPOSITORY, useValue: repo },
      ],
    });
    useCase = TestBed.inject(GetProjectNewsDetailUseCase);
  }

  it("делегирует (projectId, newsId) в fetchNewsDetail", () => {
    setup();
    repo.fetchNewsDetail.mockReturnValue(of({} as FeedNews));

    useCase.execute("p1", "42").subscribe();

    expect(repo.fetchNewsDetail).toHaveBeenCalledExactlyOnceWith("p1", "42");
  });

  it("при успехе возвращает ok с новостью", () =>
    new Promise<void>(done => {
      setup();
      const news = { id: 42 } as FeedNews;
      repo.fetchNewsDetail.mockReturnValue(of(news));

      useCase.execute("p1", "42").subscribe(result => {
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.value).toBe(news);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'get_project_news_detail_error' } с cause", () =>
    new Promise<void>(done => {
      setup();
      const err = new Error("boom");
      repo.fetchNewsDetail.mockReturnValue(throwError(() => err));

      useCase.execute("p1", "42").subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.kind).toBe("get_project_news_detail_error");
          expect(result.error.cause).toBe(err);
        }
        done();
      });
    }));
});
