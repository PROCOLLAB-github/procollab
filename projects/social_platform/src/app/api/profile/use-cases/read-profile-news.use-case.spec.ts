/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { ReadProfileNewsUseCase } from "./read-profile-news.use-case";
import {
  NewsRepositoryPort,
  PROFILE_NEWS_REPOSITORY,
} from "@domain/news/port/news.repository.port";

describe("ReadProfileNewsUseCase", () => {
  let useCase: ReadProfileNewsUseCase;
  let repo: any;

  function setup(): void {
    repo = { readNews: vi.fn() };
    TestBed.configureTestingModule({
      providers: [ReadProfileNewsUseCase, { provide: PROFILE_NEWS_REPOSITORY, useValue: repo }],
    });
    useCase = TestBed.inject(ReadProfileNewsUseCase);
  }

  it("делегирует userId и newsIds в репозиторий", () => {
    setup();
    repo.readNews.mockReturnValue(of([]));

    useCase.execute(1, [10, 20]).subscribe();

    expect(repo.readNews).toHaveBeenCalledExactlyOnceWith(1, [10, 20]);
  });

  it("при успехе возвращает ok со значением из репозитория", () =>
    new Promise<void>(done => {
      setup();
      repo.readNews.mockReturnValue(of([]));

      useCase.execute(1, [10]).subscribe(result => {
        expect(result.ok).toBe(true);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'read_profile_news_error' } с cause", () =>
    new Promise<void>(done => {
      setup();
      const boom = new Error("boom");
      repo.readNews.mockReturnValue(throwError(() => boom));

      useCase.execute(1, [10]).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.kind).toBe("read_profile_news_error");
          expect(result.error.cause).toBe(boom);
        }
        done();
      });
    }));
});
