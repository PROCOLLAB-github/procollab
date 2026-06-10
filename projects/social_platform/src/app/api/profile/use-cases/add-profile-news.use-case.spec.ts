/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { AddProfileNewsUseCase } from "./add-profile-news.use-case";
import {
  NewsRepositoryPort,
  PROFILE_NEWS_REPOSITORY,
} from "@domain/news/port/news.repository.port";
import { ProfileNews } from "@domain/profile/profile-news.model";

describe("AddProfileNewsUseCase", () => {
  let useCase: AddProfileNewsUseCase;
  let repo: any;

  function setup(): void {
    repo = { addNews: vi.fn() };
    TestBed.configureTestingModule({
      providers: [AddProfileNewsUseCase, { provide: PROFILE_NEWS_REPOSITORY, useValue: repo }],
    });
    useCase = TestBed.inject(AddProfileNewsUseCase);
  }

  it("делегирует userId и news в репозиторий", () => {
    setup();
    repo.addNews.mockReturnValue(of({} as ProfileNews));
    const payload = { text: "hello", files: ["f1"] };

    useCase.execute("u1", payload).subscribe();

    expect(repo.addNews).toHaveBeenCalledExactlyOnceWith("u1", payload);
  });

  it("при успехе возвращает ok с новостью", () =>
    new Promise<void>(done => {
      setup();
      const news = { id: 1 } as unknown as ProfileNews;
      repo.addNews.mockReturnValue(of(news));

      useCase.execute("u1", { text: "x", files: [] }).subscribe(result => {
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.value).toBe(news);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'add_profile_news_error' } с cause", () =>
    new Promise<void>(done => {
      setup();
      const boom = new Error("boom");
      repo.addNews.mockReturnValue(throwError(() => boom));

      useCase.execute("u1", { text: "x", files: [] }).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.kind).toBe("add_profile_news_error");
          expect(result.error.cause).toBe(boom);
        }
        done();
      });
    }));
});
