/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { ToggleProfileNewsLikeUseCase } from "./toggle-profile-news-like.use-case";
import { ProfileNewsRepositoryPort } from "@domain/profile/ports/profile-news.repository.port";

describe("ToggleProfileNewsLikeUseCase", () => {
  let useCase: ToggleProfileNewsLikeUseCase;
  let repo: jasmine.SpyObj<ProfileNewsRepositoryPort>;

  function setup(): void {
    repo = jasmine.createSpyObj<ProfileNewsRepositoryPort>("ProfileNewsRepositoryPort", [
      "toggleLike",
    ]);
    TestBed.configureTestingModule({
      providers: [
        ToggleProfileNewsLikeUseCase,
        { provide: ProfileNewsRepositoryPort, useValue: repo },
      ],
    });
    useCase = TestBed.inject(ToggleProfileNewsLikeUseCase);
  }

  it("делегирует параметры в репозиторий", () => {
    setup();
    repo.toggleLike.and.returnValue(of(undefined));

    useCase.execute("u1", 42, true).subscribe();

    expect(repo.toggleLike).toHaveBeenCalledOnceWith("u1", 42, true);
  });

  it("при успехе возвращает ok<void>", done => {
    setup();
    repo.toggleLike.and.returnValue(of(undefined));

    useCase.execute("u1", 42, false).subscribe(result => {
      expect(result.ok).toBe(true);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'toggle_profile_news_like_error' } с cause", done => {
    setup();
    const boom = new Error("boom");
    repo.toggleLike.and.returnValue(throwError(() => boom));

    useCase.execute("u1", 42, true).subscribe(result => {
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe("toggle_profile_news_like_error");
        expect(result.error.cause).toBe(boom);
      }
      done();
    });
  });
});
