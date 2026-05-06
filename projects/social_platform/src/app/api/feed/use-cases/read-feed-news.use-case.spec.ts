/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { ReadFeedNewsUseCase } from "./read-feed-news.use-case";
import { ProfileNewsRepositoryPort } from "@domain/profile/ports/profile-news.repository.port";
import { ProjectNewsRepositoryPort } from "@domain/project/ports/project-news.repository.port";

describe("ReadFeedNewsUseCase", () => {
  let useCase: ReadFeedNewsUseCase;
  let profileNewsRepo: jasmine.SpyObj<ProfileNewsRepositoryPort>;
  let projectNewsRepo: jasmine.SpyObj<ProjectNewsRepositoryPort>;

  function setup(): void {
    profileNewsRepo = jasmine.createSpyObj<ProfileNewsRepositoryPort>("ProfileNewsRepositoryPort", [
      "readNews",
    ]);
    projectNewsRepo = jasmine.createSpyObj<ProjectNewsRepositoryPort>("ProjectNewsRepositoryPort", [
      "readNews",
    ]);

    TestBed.configureTestingModule({
      providers: [
        ReadFeedNewsUseCase,
        { provide: ProfileNewsRepositoryPort, useValue: profileNewsRepo },
        { provide: ProjectNewsRepositoryPort, useValue: projectNewsRepo },
      ],
    });
    useCase = TestBed.inject(ReadFeedNewsUseCase);
  }

  it("для ownerType='profile' вызывает profileNewsRepository и НЕ вызывает projectNewsRepository", () => {
    setup();
    profileNewsRepo.readNews.and.returnValue(of([]));

    useCase.execute("profile", 1, [10, 20]).subscribe();

    expect(profileNewsRepo.readNews).toHaveBeenCalledOnceWith(1, [10, 20]);
    expect(projectNewsRepo.readNews).not.toHaveBeenCalled();
  });

  it("для ownerType='project' вызывает projectNewsRepository и НЕ вызывает profileNewsRepository", () => {
    setup();
    projectNewsRepo.readNews.and.returnValue(of([]));

    useCase.execute("project", 1, [10]).subscribe();

    expect(projectNewsRepo.readNews).toHaveBeenCalledOnceWith(1, [10]);
    expect(profileNewsRepo.readNews).not.toHaveBeenCalled();
  });

  it("при успехе возвращает ok со значением из репозитория", done => {
    setup();
    profileNewsRepo.readNews.and.returnValue(of([]));

    useCase.execute("profile", 1, [10]).subscribe(result => {
      expect(result.ok).toBe(true);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'read_feed_news_error' } с cause", done => {
    setup();
    const boom = new Error("boom");
    profileNewsRepo.readNews.and.returnValue(throwError(() => boom));

    useCase.execute("profile", 1, [10]).subscribe(result => {
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe("read_feed_news_error");
        expect(result.error.cause).toBe(boom);
      }
      done();
    });
  });
});
