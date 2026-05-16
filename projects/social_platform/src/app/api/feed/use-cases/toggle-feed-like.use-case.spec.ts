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
  let profileNewsRepo: jasmine.SpyObj<NewsRepositoryPort<any>>;
  let projectNewsRepo: jasmine.SpyObj<NewsRepositoryPort<any>>;

  function setup(): void {
    profileNewsRepo = jasmine.createSpyObj<NewsRepositoryPort<any>>("ProfileNewsRepository", [
      "toggleLike",
    ]);
    projectNewsRepo = jasmine.createSpyObj<NewsRepositoryPort<any>>("ProjectNewsRepository", [
      "toggleLike",
    ]);

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
    profileNewsRepo.toggleLike.and.returnValue(of(undefined));

    useCase.execute("profile", "42", 10, true).subscribe();

    expect(profileNewsRepo.toggleLike).toHaveBeenCalledOnceWith("42", 10, true);
    expect(projectNewsRepo.toggleLike).not.toHaveBeenCalled();
  });

  it("для ownerType='project' делегирует в projectNewsRepository", () => {
    setup();
    projectNewsRepo.toggleLike.and.returnValue(of(undefined));

    useCase.execute("project", "42", 10, false).subscribe();

    expect(projectNewsRepo.toggleLike).toHaveBeenCalledOnceWith("42", 10, false);
    expect(profileNewsRepo.toggleLike).not.toHaveBeenCalled();
  });

  it("при успехе возвращает ok<void>", done => {
    setup();
    profileNewsRepo.toggleLike.and.returnValue(of(undefined));

    useCase.execute("profile", "42", 10, true).subscribe(result => {
      expect(result.ok).toBe(true);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'toggle_feed_like_error' } с cause", done => {
    setup();
    const boom = new Error("boom");
    profileNewsRepo.toggleLike.and.returnValue(throwError(() => boom));

    useCase.execute("profile", "42", 10, true).subscribe(result => {
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe("toggle_feed_like_error");
        expect(result.error.cause).toBe(boom);
      }
      done();
    });
  });
});
