/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { FetchProfileNewsUseCase } from "./fetch-profile-news.use-case";
import { ProfileNewsRepositoryPort } from "@domain/profile/ports/profile-news.repository.port";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { ProfileNews } from "@domain/profile/profile-news.model";

describe("FetchProfileNewsUseCase", () => {
  let useCase: FetchProfileNewsUseCase;
  let repo: jasmine.SpyObj<ProfileNewsRepositoryPort>;

  function setup(): void {
    repo = jasmine.createSpyObj<ProfileNewsRepositoryPort>("ProfileNewsRepositoryPort", [
      "fetchNews",
    ]);
    TestBed.configureTestingModule({
      providers: [FetchProfileNewsUseCase, { provide: ProfileNewsRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(FetchProfileNewsUseCase);
  }

  const page: ApiPagination<ProfileNews> = {
    count: 0,
    results: [],
    next: "",
    previous: "",
  };

  it("делегирует userId в репозиторий", () => {
    setup();
    repo.fetchNews.and.returnValue(of(page));

    useCase.execute(42).subscribe();

    expect(repo.fetchNews).toHaveBeenCalledOnceWith(42);
  });

  it("при успехе возвращает ok со страницей новостей", done => {
    setup();
    repo.fetchNews.and.returnValue(of(page));

    useCase.execute(42).subscribe(result => {
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe(page);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'fetch_profile_news_error' } с cause", done => {
    setup();
    const boom = new Error("boom");
    repo.fetchNews.and.returnValue(throwError(() => boom));

    useCase.execute(42).subscribe(result => {
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe("fetch_profile_news_error");
        expect(result.error.cause).toBe(boom);
      }
      done();
    });
  });
});
