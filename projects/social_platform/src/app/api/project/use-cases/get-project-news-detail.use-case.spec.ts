/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { GetProjectNewsDetailUseCase } from "./get-project-news-detail.use-case";
import { ProjectNewsRepositoryPort } from "@domain/project/ports/project-news.repository.port";
import { FeedNews } from "@domain/project/project-news.model";

describe("GetProjectNewsDetailUseCase", () => {
  let useCase: GetProjectNewsDetailUseCase;
  let repo: jasmine.SpyObj<ProjectNewsRepositoryPort>;

  function setup(): void {
    repo = jasmine.createSpyObj<ProjectNewsRepositoryPort>("ProjectNewsRepositoryPort", [
      "fetchNewsDetail",
    ]);
    TestBed.configureTestingModule({
      providers: [
        GetProjectNewsDetailUseCase,
        { provide: ProjectNewsRepositoryPort, useValue: repo },
      ],
    });
    useCase = TestBed.inject(GetProjectNewsDetailUseCase);
  }

  it("делегирует (projectId, newsId) в fetchNewsDetail", () => {
    setup();
    repo.fetchNewsDetail.and.returnValue(of({} as FeedNews));

    useCase.execute("p1", "42").subscribe();

    expect(repo.fetchNewsDetail).toHaveBeenCalledOnceWith("p1", "42");
  });

  it("при успехе возвращает ok с новостью", done => {
    setup();
    const news = { id: 42 } as FeedNews;
    repo.fetchNewsDetail.and.returnValue(of(news));

    useCase.execute("p1", "42").subscribe(result => {
      expect(result.ok).toBeTrue();
      if (result.ok) expect(result.value).toBe(news);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'get_project_news_detail_error' } с cause", done => {
    setup();
    const err = new Error("boom");
    repo.fetchNewsDetail.and.returnValue(throwError(() => err));

    useCase.execute("p1", "42").subscribe(result => {
      expect(result.ok).toBeFalse();
      if (!result.ok) {
        expect(result.error.kind).toBe("get_project_news_detail_error");
        expect(result.error.cause).toBe(err);
      }
      done();
    });
  });
});
