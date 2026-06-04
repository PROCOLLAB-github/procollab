/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { AddProjectNewsUseCase } from "./add-project-news.use-case";
import {
  NewsRepositoryPort,
  PROJECT_NEWS_REPOSITORY,
} from "@domain/news/port/news.repository.port";
import { FeedNews } from "@domain/news/project-news.model";

describe("AddProjectNewsUseCase", () => {
  let useCase: AddProjectNewsUseCase;
  let repo: any;

  function setup(): void {
    repo = { addNews: vi.fn() };
    TestBed.configureTestingModule({
      providers: [AddProjectNewsUseCase, { provide: PROJECT_NEWS_REPOSITORY, useValue: repo }],
    });
    useCase = TestBed.inject(AddProjectNewsUseCase);
  }

  it("делегирует (projectId, {text, files}) в репозиторий", () => {
    setup();
    repo.addNews.mockReturnValue(of({} as FeedNews));
    const news = { text: "hi", files: ["f"] };

    useCase.execute("p1", news).subscribe();

    expect(repo.addNews).toHaveBeenCalledExactlyOnceWith("p1", news);
  });

  it("при успехе возвращает ok с созданной новостью", () =>
    new Promise<void>(done => {
      setup();
      const created = { id: 42 } as FeedNews;
      repo.addNews.mockReturnValue(of(created));

      useCase.execute("p1", { text: "hi", files: [] }).subscribe(result => {
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.value).toBe(created);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'add_project_news_error' } с cause", () =>
    new Promise<void>(done => {
      setup();
      const err = new Error("boom");
      repo.addNews.mockReturnValue(throwError(() => err));

      useCase.execute("p1", { text: "hi", files: [] }).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.kind).toBe("add_project_news_error");
          expect(result.error.cause).toBe(err);
        }
        done();
      });
    }));
});
