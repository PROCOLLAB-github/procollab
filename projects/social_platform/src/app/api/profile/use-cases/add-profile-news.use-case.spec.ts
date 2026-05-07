/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { AddProfileNewsUseCase } from "./add-profile-news.use-case";
import { ProfileNewsRepositoryPort } from "@domain/profile/ports/profile-news.repository.port";
import { ProfileNews } from "@domain/profile/profile-news.model";

describe("AddProfileNewsUseCase", () => {
  let useCase: AddProfileNewsUseCase;
  let repo: jasmine.SpyObj<ProfileNewsRepositoryPort>;

  function setup(): void {
    repo = jasmine.createSpyObj<ProfileNewsRepositoryPort>("ProfileNewsRepositoryPort", [
      "addNews",
    ]);
    TestBed.configureTestingModule({
      providers: [AddProfileNewsUseCase, { provide: ProfileNewsRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(AddProfileNewsUseCase);
  }

  it("делегирует userId и news в репозиторий", () => {
    setup();
    repo.addNews.and.returnValue(of({} as ProfileNews));
    const payload = { text: "hello", files: ["f1"] };

    useCase.execute("u1", payload).subscribe();

    expect(repo.addNews).toHaveBeenCalledOnceWith("u1", payload);
  });

  it("при успехе возвращает ok с новостью", done => {
    setup();
    const news = { id: 1 } as unknown as ProfileNews;
    repo.addNews.and.returnValue(of(news));

    useCase.execute("u1", { text: "x", files: [] }).subscribe(result => {
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe(news);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'add_profile_news_error' } с cause", done => {
    setup();
    const boom = new Error("boom");
    repo.addNews.and.returnValue(throwError(() => boom));

    useCase.execute("u1", { text: "x", files: [] }).subscribe(result => {
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe("add_profile_news_error");
        expect(result.error.cause).toBe(boom);
      }
      done();
    });
  });
});
