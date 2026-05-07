/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { DeleteProfileNewsUseCase } from "./delete-profile-news.use-case";
import { ProfileNewsRepositoryPort } from "@domain/profile/ports/profile-news.repository.port";

describe("DeleteProfileNewsUseCase", () => {
  let useCase: DeleteProfileNewsUseCase;
  let repo: jasmine.SpyObj<ProfileNewsRepositoryPort>;

  function setup(): void {
    repo = jasmine.createSpyObj<ProfileNewsRepositoryPort>("ProfileNewsRepositoryPort", ["delete"]);
    TestBed.configureTestingModule({
      providers: [DeleteProfileNewsUseCase, { provide: ProfileNewsRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(DeleteProfileNewsUseCase);
  }

  it("делегирует userId и newsId в репозиторий", () => {
    setup();
    repo.delete.and.returnValue(of(undefined));

    useCase.execute("u1", 42).subscribe();

    expect(repo.delete).toHaveBeenCalledOnceWith("u1", 42);
  });

  it("при успехе возвращает ok<void>", done => {
    setup();
    repo.delete.and.returnValue(of(undefined));

    useCase.execute("u1", 42).subscribe(result => {
      expect(result.ok).toBe(true);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'delete_profile_news_error' } с cause", done => {
    setup();
    const boom = new Error("boom");
    repo.delete.and.returnValue(throwError(() => boom));

    useCase.execute("u1", 42).subscribe(result => {
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe("delete_profile_news_error");
        expect(result.error.cause).toBe(boom);
      }
      done();
    });
  });
});
