/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { DeleteNewsUseCase } from "./delete-news.use-case";
import { ProgramNewsRepositoryPort } from "@domain/program/ports/program-news.repository.port";

describe("DeleteNewsUseCase", () => {
  let useCase: DeleteNewsUseCase;
  let repo: jasmine.SpyObj<ProgramNewsRepositoryPort>;

  function setup(): void {
    repo = jasmine.createSpyObj<ProgramNewsRepositoryPort>("ProgramNewsRepositoryPort", [
      "deleteNews",
    ]);
    TestBed.configureTestingModule({
      providers: [DeleteNewsUseCase, { provide: ProgramNewsRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(DeleteNewsUseCase);
  }

  it("делегирует (programId, newsId) в репозиторий", () => {
    setup();
    repo.deleteNews.and.returnValue(of(undefined));

    useCase.execute(1, 42).subscribe();

    expect(repo.deleteNews).toHaveBeenCalledOnceWith(1, 42);
  });

  it("при успехе возвращает ok с удалённым newsId", done => {
    setup();
    repo.deleteNews.and.returnValue(of(undefined));

    useCase.execute(1, 42).subscribe(result => {
      expect(result.ok).toBeTrue();
      if (result.ok) expect(result.value).toBe(42);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'unknown' }", done => {
    setup();
    repo.deleteNews.and.returnValue(throwError(() => new Error("boom")));

    useCase.execute(1, 42).subscribe(result => {
      expect(result.ok).toBeFalse();
      if (!result.ok) expect(result.error.kind).toBe("unknown");
      done();
    });
  });
});
