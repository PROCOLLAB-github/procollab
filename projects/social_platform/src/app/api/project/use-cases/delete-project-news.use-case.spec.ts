/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { DeleteProjectNewsUseCase } from "./delete-project-news.use-case";
import {
  NewsRepositoryPort,
  PROJECT_NEWS_REPOSITORY,
} from "@domain/news/port/news.repository.port";

describe("DeleteProjectNewsUseCase", () => {
  let useCase: DeleteProjectNewsUseCase;
  let repo: any;

  function setup(): void {
    repo = { delete: vi.fn() };
    TestBed.configureTestingModule({
      providers: [DeleteProjectNewsUseCase, { provide: PROJECT_NEWS_REPOSITORY, useValue: repo }],
    });
    useCase = TestBed.inject(DeleteProjectNewsUseCase);
  }

  it("делегирует (projectId, newsId) в delete", () => {
    setup();
    repo.delete.mockReturnValue(of(undefined));

    useCase.execute("p1", 42).subscribe();

    expect(repo.delete).toHaveBeenCalledExactlyOnceWith("p1", 42);
  });

  it("при успехе возвращает ok с удалённым newsId", () =>
    new Promise<void>(done => {
      setup();
      repo.delete.mockReturnValue(of(undefined));

      useCase.execute("p1", 42).subscribe(result => {
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.value).toBe(42);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'delete_project_news_error' } с cause", () =>
    new Promise<void>(done => {
      setup();
      const err = new Error("boom");
      repo.delete.mockReturnValue(throwError(() => err));

      useCase.execute("p1", 42).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.kind).toBe("delete_project_news_error");
          expect(result.error.cause).toBe(err);
        }
        done();
      });
    }));
});
