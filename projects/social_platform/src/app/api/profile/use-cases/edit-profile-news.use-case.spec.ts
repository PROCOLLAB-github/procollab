/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { EditProfileNewsUseCase } from "./edit-profile-news.use-case";
import { ProfileNewsRepositoryPort } from "@domain/profile/ports/profile-news.repository.port";
import { ProfileNews } from "@domain/profile/profile-news.model";

describe("EditProfileNewsUseCase", () => {
  let useCase: EditProfileNewsUseCase;
  let repo: jasmine.SpyObj<ProfileNewsRepositoryPort>;

  function setup(): void {
    repo = jasmine.createSpyObj<ProfileNewsRepositoryPort>("ProfileNewsRepositoryPort", [
      "editNews",
    ]);
    TestBed.configureTestingModule({
      providers: [EditProfileNewsUseCase, { provide: ProfileNewsRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(EditProfileNewsUseCase);
  }

  it("делегирует параметры в репозиторий", () => {
    setup();
    repo.editNews.and.returnValue(of({} as ProfileNews));
    const patch: Partial<ProfileNews> = { text: "edited" } as Partial<ProfileNews>;

    useCase.execute("u1", 7, patch).subscribe();

    expect(repo.editNews).toHaveBeenCalledOnceWith("u1", 7, patch);
  });

  it("при успехе возвращает ok с обновлённой новостью", done => {
    setup();
    const news = { id: 7 } as unknown as ProfileNews;
    repo.editNews.and.returnValue(of(news));

    useCase.execute("u1", 7, {} as Partial<ProfileNews>).subscribe(result => {
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe(news);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'edit_profile_news_error' } с cause", done => {
    setup();
    const boom = new Error("boom");
    repo.editNews.and.returnValue(throwError(() => boom));

    useCase.execute("u1", 7, {} as Partial<ProfileNews>).subscribe(result => {
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe("edit_profile_news_error");
        expect(result.error.cause).toBe(boom);
      }
      done();
    });
  });
});
