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
  let repo: jasmine.SpyObj<NewsRepositoryPort<any>>;

  function setup(): void {
    repo = jasmine.createSpyObj<NewsRepositoryPort<any>>("NewsRepositoryPort", ["readNews"]);
    TestBed.configureTestingModule({
      providers: [ReadNewsUseCase, { provide: PROGRAM_NEWS_REPOSITORY, useValue: repo }],
    });
    useCase = TestBed.inject(ReadNewsUseCase);
  }

  it("делегирует (programId, newsIds) в репозиторий", () => {
    setup();
    repo.readNews.and.returnValue(of([]));
    const ids = [1, 2, 3];

    useCase.execute("1", ids).subscribe();

    expect(repo.readNews).toHaveBeenCalledOnceWith(1, ids);
  });

  it("при успехе возвращает ok<void>", done => {
    setup();
    repo.readNews.and.returnValue(of([]));

    useCase.execute("prog1", [1]).subscribe(result => {
      expect(result.ok).toBeTrue();
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'unknown' }", done => {
    setup();
    repo.readNews.and.returnValue(throwError(() => new Error("boom")));

    useCase.execute("prog1", [1]).subscribe(result => {
      expect(result.ok).toBeFalse();
      if (!result.ok) expect(result.error.kind).toBe("unknown");
      done();
    });
  });
});
