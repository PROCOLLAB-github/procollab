/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { ToggleLikeUseCase } from "./toggle-like.use-case";
import {
  NewsRepositoryPort,
  PROGRAM_NEWS_REPOSITORY,
} from "@domain/news/port/news.repository.port";

describe("ToggleLikeUseCase", () => {
  let useCase: ToggleLikeUseCase;
  let repo: any;

  function setup(): void {
    repo = { toggleLike: vi.fn() };
    TestBed.configureTestingModule({
      providers: [ToggleLikeUseCase, { provide: PROGRAM_NEWS_REPOSITORY, useValue: repo }],
    });
    useCase = TestBed.inject(ToggleLikeUseCase);
  }

  it("делегирует (programId, newsId, state) в репозиторий", () => {
    setup();
    repo.toggleLike.mockReturnValue(of(undefined));

    useCase.execute("prog1", 42, true).subscribe();

    expect(repo.toggleLike).toHaveBeenCalledExactlyOnceWith("prog1", 42, true);
  });

  it("при успехе возвращает ok с newsId", () =>
    new Promise<void>(done => {
      setup();
      repo.toggleLike.mockReturnValue(of(undefined));

      useCase.execute("prog1", 42, false).subscribe(result => {
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.value).toBe(42);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'unknown' }", () =>
    new Promise<void>(done => {
      setup();
      repo.toggleLike.mockReturnValue(throwError(() => new Error("boom")));

      useCase.execute("prog1", 42, true).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.error.kind).toBe("unknown");
        done();
      });
    }));
});
