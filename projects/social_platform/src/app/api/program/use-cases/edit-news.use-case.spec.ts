/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { EditNewsUseCase } from "./edit-news.use-case";
import {
  NewsRepositoryPort,
  PROGRAM_NEWS_REPOSITORY,
} from "@domain/news/port/news.repository.port";
import { FeedNews } from "@domain/news/project-news.model";

describe("EditNewsUseCase", () => {
  let useCase: EditNewsUseCase;
  let repo: jasmine.SpyObj<NewsRepositoryPort<any>>;

  function setup(): void {
    repo = jasmine.createSpyObj<NewsRepositoryPort<any>>("NewsRepositoryPort", ["editNews"]);
    TestBed.configureTestingModule({
      providers: [EditNewsUseCase, { provide: PROGRAM_NEWS_REPOSITORY, useValue: repo }],
    });
    useCase = TestBed.inject(EditNewsUseCase);
  }

  it("делегирует (programId, newsId, patch) в репозиторий", () => {
    setup();
    repo.editNews.and.returnValue(of({} as FeedNews));
    const patch: Partial<FeedNews> = { text: "new" };

    useCase.execute(1, 42, patch).subscribe();

    expect(repo.editNews).toHaveBeenCalledOnceWith("1", 42, patch);
  });

  it("при успехе возвращает ok с обновлённой новостью", done => {
    setup();
    const news = { id: 42 } as FeedNews;
    repo.editNews.and.returnValue(of(news));

    useCase.execute(1, 42, {}).subscribe(result => {
      expect(result.ok).toBeTrue();
      if (result.ok) expect(result.value).toBe(news);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'unknown' }", done => {
    setup();
    repo.editNews.and.returnValue(throwError(() => new Error("boom")));

    useCase.execute(1, 42, {}).subscribe(result => {
      expect(result.ok).toBeFalse();
      if (!result.ok) expect(result.error.kind).toBe("unknown");
      done();
    });
  });
});
