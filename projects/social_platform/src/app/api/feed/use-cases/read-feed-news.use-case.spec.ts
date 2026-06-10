/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { ReadFeedNewsUseCase } from "./read-feed-news.use-case";
import {
  NewsRepositoryPort,
  PROFILE_NEWS_REPOSITORY,
  PROJECT_NEWS_REPOSITORY,
} from "@domain/news/port/news.repository.port";

describe("ReadFeedNewsUseCase", () => {
  let useCase: ReadFeedNewsUseCase;
  let profileNewsRepo: any;
  let projectNewsRepo: any;

  function setup(): void {
    profileNewsRepo = { readNews: vi.fn() };
    projectNewsRepo = { readNews: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        ReadFeedNewsUseCase,
        { provide: PROFILE_NEWS_REPOSITORY, useValue: profileNewsRepo },
        { provide: PROJECT_NEWS_REPOSITORY, useValue: projectNewsRepo },
      ],
    });
    useCase = TestBed.inject(ReadFeedNewsUseCase);
  }

  it("для ownerType='profile' вызывает profileNewsRepository и НЕ вызывает projectNewsRepository", () => {
    setup();
    profileNewsRepo.readNews.mockReturnValue(of([]));

    useCase.execute("profile", 1, [10, 20]).subscribe();

    expect(profileNewsRepo.readNews).toHaveBeenCalledExactlyOnceWith(1, [10, 20]);
    expect(projectNewsRepo.readNews).not.toHaveBeenCalled();
  });

  it("для ownerType='project' вызывает projectNewsRepository и НЕ вызывает profileNewsRepository", () => {
    setup();
    projectNewsRepo.readNews.mockReturnValue(of([]));

    useCase.execute("project", 1, [10]).subscribe();

    expect(projectNewsRepo.readNews).toHaveBeenCalledExactlyOnceWith(1, [10]);
    expect(profileNewsRepo.readNews).not.toHaveBeenCalled();
  });

  it("при успехе возвращает ok со значением из репозитория", () =>
    new Promise<void>(done => {
      setup();
      profileNewsRepo.readNews.mockReturnValue(of([]));

      useCase.execute("profile", 1, [10]).subscribe(result => {
        expect(result.ok).toBe(true);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'read_feed_news_error' } с cause", () =>
    new Promise<void>(done => {
      setup();
      const boom = new Error("boom");
      profileNewsRepo.readNews.mockReturnValue(throwError(() => boom));

      useCase.execute("profile", 1, [10]).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.kind).toBe("read_feed_news_error");
          expect(result.error.cause).toBe(boom);
        }
        done();
      });
    }));
});
