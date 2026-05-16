/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { ReadProjectNewsUseCase } from "./read-project-news.use-case";
import {
  NewsRepositoryPort,
  PROJECT_NEWS_REPOSITORY,
} from "@domain/news/port/news.repository.port";

describe("ReadProjectNewsUseCase", () => {
  let useCase: ReadProjectNewsUseCase;
  let repo: jasmine.SpyObj<NewsRepositoryPort<any>>;

  function setup(): void {
    repo = jasmine.createSpyObj<NewsRepositoryPort<any>>("NewsRepositoryPort", ["readNews"]);
    TestBed.configureTestingModule({
      providers: [ReadProjectNewsUseCase, { provide: PROJECT_NEWS_REPOSITORY, useValue: repo }],
    });
    useCase = TestBed.inject(ReadProjectNewsUseCase);
  }

  it("делегирует (projectId, newsIds) в readNews", () => {
    setup();
    repo.readNews.and.returnValue(of([]));

    useCase.execute(1, [10, 20]).subscribe();

    expect(repo.readNews).toHaveBeenCalledOnceWith(1, [10, 20]);
  });

  it("при успехе возвращает ok с результатом", done => {
    setup();
    const res: void[] = [];
    repo.readNews.and.returnValue(of(res));

    useCase.execute(1, [10]).subscribe(result => {
      expect(result.ok).toBeTrue();
      if (result.ok) expect(result.value).toBe(res);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'read_project_news_error' } с cause", done => {
    setup();
    const err = new Error("boom");
    repo.readNews.and.returnValue(throwError(() => err));

    useCase.execute(1, [10]).subscribe(result => {
      expect(result.ok).toBeFalse();
      if (!result.ok) {
        expect(result.error.kind).toBe("read_project_news_error");
        expect(result.error.cause).toBe(err);
      }
      done();
    });
  });
});
