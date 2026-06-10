/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { EditProfileNewsUseCase } from "./edit-profile-news.use-case";
import {
  NewsRepositoryPort,
  PROFILE_NEWS_REPOSITORY,
} from "@domain/news/port/news.repository.port";
import { ProfileNews } from "@domain/profile/profile-news.model";

describe("EditProfileNewsUseCase", () => {
  let useCase: EditProfileNewsUseCase;
  let repo: any;

  function setup(): void {
    repo = { editNews: vi.fn() };
    TestBed.configureTestingModule({
      providers: [EditProfileNewsUseCase, { provide: PROFILE_NEWS_REPOSITORY, useValue: repo }],
    });
    useCase = TestBed.inject(EditProfileNewsUseCase);
  }

  it("делегирует параметры в репозиторий", () => {
    setup();
    repo.editNews.mockReturnValue(of({} as ProfileNews));
    const patch: Partial<ProfileNews> = { text: "edited" } as Partial<ProfileNews>;

    useCase.execute("u1", 7, patch).subscribe();

    expect(repo.editNews).toHaveBeenCalledExactlyOnceWith("u1", 7, patch);
  });

  it("при успехе возвращает ok с обновлённой новостью", () =>
    new Promise<void>(done => {
      setup();
      const news = { id: 7 } as unknown as ProfileNews;
      repo.editNews.mockReturnValue(of(news));

      useCase.execute("u1", 7, {} as Partial<ProfileNews>).subscribe(result => {
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.value).toBe(news);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'edit_profile_news_error' } с cause", () =>
    new Promise<void>(done => {
      setup();
      const boom = new Error("boom");
      repo.editNews.mockReturnValue(throwError(() => boom));

      useCase.execute("u1", 7, {} as Partial<ProfileNews>).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.kind).toBe("edit_profile_news_error");
          expect(result.error.cause).toBe(boom);
        }
        done();
      });
    }));
});
