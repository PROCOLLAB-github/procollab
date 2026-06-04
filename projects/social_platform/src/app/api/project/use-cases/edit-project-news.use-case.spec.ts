/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { EditProjectNewsUseCase } from "./edit-project-news.use-case";
import {
  NewsRepositoryPort,
  PROJECT_NEWS_REPOSITORY,
} from "@domain/news/port/news.repository.port";
import { FeedNews } from "@domain/news/project-news.model";

describe("EditProjectNewsUseCase", () => {
  let useCase: EditProjectNewsUseCase;
  let repo: any;

  function setup(): void {
    repo = { editNews: vi.fn() };
    TestBed.configureTestingModule({
      providers: [EditProjectNewsUseCase, { provide: PROJECT_NEWS_REPOSITORY, useValue: repo }],
    });
    useCase = TestBed.inject(EditProjectNewsUseCase);
  }

  it("делегирует (projectId, newsId, patch) в editNews", () => {
    setup();
    repo.editNews.mockReturnValue(of({} as FeedNews));
    const patch: Partial<FeedNews> = { text: "new" };

    useCase.execute("p1", 42, patch).subscribe();

    expect(repo.editNews).toHaveBeenCalledExactlyOnceWith("p1", 42, patch);
  });

  it("при успехе возвращает ok с обновлённой новостью", () =>
    new Promise<void>(done => {
      setup();
      const news = { id: 42 } as FeedNews;
      repo.editNews.mockReturnValue(of(news));

      useCase.execute("p1", 42, {}).subscribe(result => {
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.value).toBe(news);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'edit_project_news_error' } с cause", () =>
    new Promise<void>(done => {
      setup();
      const err = new Error("boom");
      repo.editNews.mockReturnValue(throwError(() => err));

      useCase.execute("p1", 42, {}).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.kind).toBe("edit_project_news_error");
          expect(result.error.cause).toBe(err);
        }
        done();
      });
    }));
});
