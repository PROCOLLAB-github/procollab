/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { ReadNewsUseCase } from "./read-news.use-case";
import {
  NewsRepositoryPort,
  PROGRAM_NEWS_REPOSITORY,
} from "@domain/news/port/news.repository.port";

describe("ReadNewsUseCase", () => {
  let useCase: ReadNewsUseCase;
  let repo: any;

  function setup(): void {
    repo = { readNews: vi.fn() };
    TestBed.configureTestingModule({
      providers: [ReadNewsUseCase, { provide: PROGRAM_NEWS_REPOSITORY, useValue: repo }],
    });
    useCase = TestBed.inject(ReadNewsUseCase);
  }

  it("делегирует (programId, newsIds) в репозиторий", () => {
    setup();
    repo.readNews.mockReturnValue(of([]));
    const ids = [1, 2, 3];

    useCase.execute("1", ids).subscribe();

    expect(repo.readNews).toHaveBeenCalledExactlyOnceWith(1, ids);
  });

  it("при успехе возвращает ok<void>", () =>
    new Promise<void>(done => {
      setup();
      repo.readNews.mockReturnValue(of([]));

      useCase.execute("prog1", [1]).subscribe(result => {
        expect(result.ok).toBe(true);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'unknown' }", () =>
    new Promise<void>(done => {
      setup();
      repo.readNews.mockReturnValue(throwError(() => new Error("boom")));

      useCase.execute("prog1", [1]).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.error.kind).toBe("unknown");
        done();
      });
    }));
});
