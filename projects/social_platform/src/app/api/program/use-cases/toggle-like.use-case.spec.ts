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
  let repo: jasmine.SpyObj<NewsRepositoryPort<any>>;

  function setup(): void {
    repo = jasmine.createSpyObj<NewsRepositoryPort<any>>("NewsRepositoryPort", ["toggleLike"]);
    TestBed.configureTestingModule({
      providers: [ToggleLikeUseCase, { provide: PROGRAM_NEWS_REPOSITORY, useValue: repo }],
    });
    useCase = TestBed.inject(ToggleLikeUseCase);
  }

  it("делегирует (programId, newsId, state) в репозиторий", () => {
    setup();
    repo.toggleLike.and.returnValue(of(undefined));

    useCase.execute("prog1", 42, true).subscribe();

    expect(repo.toggleLike).toHaveBeenCalledOnceWith("prog1", 42, true);
  });

  it("при успехе возвращает ok с newsId", done => {
    setup();
    repo.toggleLike.and.returnValue(of(undefined));

    useCase.execute("prog1", 42, false).subscribe(result => {
      expect(result.ok).toBeTrue();
      if (result.ok) expect(result.value).toBe(42);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'unknown' }", done => {
    setup();
    repo.toggleLike.and.returnValue(throwError(() => new Error("boom")));

    useCase.execute("prog1", 42, true).subscribe(result => {
      expect(result.ok).toBeFalse();
      if (!result.ok) expect(result.error.kind).toBe("unknown");
      done();
    });
  });
});
