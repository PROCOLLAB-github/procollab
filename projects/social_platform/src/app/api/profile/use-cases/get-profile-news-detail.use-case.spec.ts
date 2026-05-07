/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { GetProfileNewsDetailUseCase } from "./get-profile-news-detail.use-case";
import { ProfileNewsRepositoryPort } from "@domain/profile/ports/profile-news.repository.port";
import { ProfileNews } from "@domain/profile/profile-news.model";

describe("GetProfileNewsDetailUseCase", () => {
  let useCase: GetProfileNewsDetailUseCase;
  let repo: jasmine.SpyObj<ProfileNewsRepositoryPort>;

  function setup(): void {
    repo = jasmine.createSpyObj<ProfileNewsRepositoryPort>("ProfileNewsRepositoryPort", [
      "fetchNewsDetail",
    ]);
    TestBed.configureTestingModule({
      providers: [
        GetProfileNewsDetailUseCase,
        { provide: ProfileNewsRepositoryPort, useValue: repo },
      ],
    });
    useCase = TestBed.inject(GetProfileNewsDetailUseCase);
  }

  it("делегирует userId и newsId в репозиторий", () => {
    setup();
    repo.fetchNewsDetail.and.returnValue(of({} as ProfileNews));

    useCase.execute("u1", "7").subscribe();

    expect(repo.fetchNewsDetail).toHaveBeenCalledOnceWith("u1", "7");
  });

  it("при успехе возвращает ok с деталью новости", done => {
    setup();
    const news = { id: 7 } as unknown as ProfileNews;
    repo.fetchNewsDetail.and.returnValue(of(news));

    useCase.execute("u1", "7").subscribe(result => {
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe(news);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'get_profile_news_detail_error' } с cause", done => {
    setup();
    const boom = new Error("boom");
    repo.fetchNewsDetail.and.returnValue(throwError(() => boom));

    useCase.execute("u1", "7").subscribe(result => {
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe("get_profile_news_detail_error");
        expect(result.error.cause).toBe(boom);
      }
      done();
    });
  });
});
