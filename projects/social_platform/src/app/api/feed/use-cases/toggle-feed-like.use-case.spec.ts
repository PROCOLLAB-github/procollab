/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { ToggleFeedLikeUseCase } from "./toggle-feed-like.use-case";
import {
  NewsRepositoryPort,
  PROFILE_NEWS_REPOSITORY,
  PROJECT_NEWS_REPOSITORY,
} from "@domain/news/port/news.repository.port";

describe("ToggleFeedLikeUseCase", () => {
  let useCase: ToggleFeedLikeUseCase;
  let profileNewsRepo: any;
  let projectNewsRepo: any;

  function setup(): void {
    profileNewsRepo = { toggleLike: vi.fn() };
    projectNewsRepo = { toggleLike: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        ToggleFeedLikeUseCase,
        { provide: PROFILE_NEWS_REPOSITORY, useValue: profileNewsRepo },
        { provide: PROJECT_NEWS_REPOSITORY, useValue: projectNewsRepo },
      ],
    });
    useCase = TestBed.inject(ToggleFeedLikeUseCase);
  }

  it("для ownerType='profile' делегирует в profileNewsRepository", () => {
    setup();
    profileNewsRepo.toggleLike.mockReturnValue(of(undefined));

    useCase.execute("profile", "42", 10, true).subscribe();

    expect(profileNewsRepo.toggleLike).toHaveBeenCalledExactlyOnceWith("42", 10, true);
    expect(projectNewsRepo.toggleLike).not.toHaveBeenCalled();
  });

  it("для ownerType='project' делегирует в projectNewsRepository", () => {
    setup();
    projectNewsRepo.toggleLike.mockReturnValue(of(undefined));

    useCase.execute("project", "42", 10, false).subscribe();

    expect(projectNewsRepo.toggleLike).toHaveBeenCalledExactlyOnceWith("42", 10, false);
    expect(profileNewsRepo.toggleLike).not.toHaveBeenCalled();
  });

  it("при успехе возвращает ok<void>", () =>
    new Promise<void>(done => {
      setup();
      profileNewsRepo.toggleLike.mockReturnValue(of(undefined));

      useCase.execute("profile", "42", 10, true).subscribe(result => {
        expect(result.ok).toBe(true);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'toggle_feed_like_error' } с cause", () =>
    new Promise<void>(done => {
      setup();
      const boom = new Error("boom");
      profileNewsRepo.toggleLike.mockReturnValue(throwError(() => boom));

      useCase.execute("profile", "42", 10, true).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.kind).toBe("toggle_feed_like_error");
          expect(result.error.cause).toBe(boom);
        }
        done();
      });
    }));
});
