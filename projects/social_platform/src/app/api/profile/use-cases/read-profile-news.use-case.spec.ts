/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { ReadProfileNewsUseCase } from "./read-profile-news.use-case";
import { ProfileNewsRepositoryPort } from "@domain/profile/ports/profile-news.repository.port";

describe("ReadProfileNewsUseCase", () => {
  let useCase: ReadProfileNewsUseCase;
  let repo: jasmine.SpyObj<ProfileNewsRepositoryPort>;

  function setup(): void {
    repo = jasmine.createSpyObj<ProfileNewsRepositoryPort>("ProfileNewsRepositoryPort", [
      "readNews",
    ]);
    TestBed.configureTestingModule({
      providers: [ReadProfileNewsUseCase, { provide: ProfileNewsRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(ReadProfileNewsUseCase);
  }

  it("делегирует userId и newsIds в репозиторий", () => {
    setup();
    repo.readNews.and.returnValue(of([]));

    useCase.execute(1, [10, 20]).subscribe();

    expect(repo.readNews).toHaveBeenCalledOnceWith(1, [10, 20]);
  });

  it("при успехе возвращает ok со значением из репозитория", done => {
    setup();
    repo.readNews.and.returnValue(of([]));

    useCase.execute(1, [10]).subscribe(result => {
      expect(result.ok).toBe(true);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'read_profile_news_error' } с cause", done => {
    setup();
    const boom = new Error("boom");
    repo.readNews.and.returnValue(throwError(() => boom));

    useCase.execute(1, [10]).subscribe(result => {
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe("read_profile_news_error");
        expect(result.error.cause).toBe(boom);
      }
      done();
    });
  });
});
