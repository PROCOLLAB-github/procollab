/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { ToggleProjectNewsLikeUseCase } from "./toggle-project-news-like.use-case";
import {
  NewsRepositoryPort,
  PROJECT_NEWS_REPOSITORY,
} from "@domain/news/port/news.repository.port";

describe("ToggleProjectNewsLikeUseCase", () => {
  let useCase: ToggleProjectNewsLikeUseCase;
  let repo: any;

  function setup(): void {
    repo = { toggleLike: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        ToggleProjectNewsLikeUseCase,
        { provide: PROJECT_NEWS_REPOSITORY, useValue: repo },
      ],
    });
    useCase = TestBed.inject(ToggleProjectNewsLikeUseCase);
  }

  it("делегирует (projectId, newsId, state) в toggleLike", () => {
    setup();
    repo.toggleLike.mockReturnValue(of(undefined));

    useCase.execute("p1", 42, true).subscribe();

    expect(repo.toggleLike).toHaveBeenCalledExactlyOnceWith("p1", 42, true);
  });

  it("при успехе возвращает ok c newsId", () =>
    new Promise<void>(done => {
      setup();
      repo.toggleLike.mockReturnValue(of(undefined));

      useCase.execute("p1", 42, true).subscribe(result => {
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.value).toBe(42);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'toggle_project_news_like_error' } с cause", () =>
    new Promise<void>(done => {
      setup();
      const err = new Error("boom");
      repo.toggleLike.mockReturnValue(throwError(() => err));

      useCase.execute("p1", 42, true).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.kind).toBe("toggle_project_news_like_error");
          expect(result.error.cause).toBe(err);
        }
        done();
      });
    }));
});
