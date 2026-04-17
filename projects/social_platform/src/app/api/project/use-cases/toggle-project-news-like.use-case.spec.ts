/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { ToggleProjectNewsLikeUseCase } from "./toggle-project-news-like.use-case";
import { ProjectNewsRepositoryPort } from "@domain/project/ports/project-news.repository.port";

describe("ToggleProjectNewsLikeUseCase", () => {
  let useCase: ToggleProjectNewsLikeUseCase;
  let repo: jasmine.SpyObj<ProjectNewsRepositoryPort>;

  function setup(): void {
    repo = jasmine.createSpyObj<ProjectNewsRepositoryPort>("ProjectNewsRepositoryPort", [
      "toggleLike",
    ]);
    TestBed.configureTestingModule({
      providers: [
        ToggleProjectNewsLikeUseCase,
        { provide: ProjectNewsRepositoryPort, useValue: repo },
      ],
    });
    useCase = TestBed.inject(ToggleProjectNewsLikeUseCase);
  }

  it("делегирует (projectId, newsId, state) в toggleLike", () => {
    setup();
    repo.toggleLike.and.returnValue(of(42));

    useCase.execute("p1", 42, true).subscribe();

    expect(repo.toggleLike).toHaveBeenCalledOnceWith("p1", 42, true);
  });

  it("при успехе возвращает ok c newsId", done => {
    setup();
    repo.toggleLike.and.returnValue(of(42));

    useCase.execute("p1", 42, true).subscribe(result => {
      expect(result.ok).toBeTrue();
      if (result.ok) expect(result.value).toBe(42);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'toggle_project_news_like_error' } с cause", done => {
    setup();
    const err = new Error("boom");
    repo.toggleLike.and.returnValue(throwError(() => err));

    useCase.execute("p1", 42, true).subscribe(result => {
      expect(result.ok).toBeFalse();
      if (!result.ok) {
        expect(result.error.kind).toBe("toggle_project_news_like_error");
        expect(result.error.cause).toBe(err);
      }
      done();
    });
  });
});
