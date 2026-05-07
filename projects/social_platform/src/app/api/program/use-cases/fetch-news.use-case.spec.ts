/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { FetchNewsUseCase } from "./fetch-news.use-case";
import { ProgramNewsRepositoryPort } from "@domain/program/ports/program-news.repository.port";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { FeedNews } from "@domain/project/project-news.model";

describe("FetchNewsUseCase", () => {
  let useCase: FetchNewsUseCase;
  let repo: jasmine.SpyObj<ProgramNewsRepositoryPort>;

  function setup(): void {
    repo = jasmine.createSpyObj<ProgramNewsRepositoryPort>("ProgramNewsRepositoryPort", [
      "fetchNews",
    ]);
    TestBed.configureTestingModule({
      providers: [FetchNewsUseCase, { provide: ProgramNewsRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(FetchNewsUseCase);
  }

  const page: ApiPagination<FeedNews> = { count: 0, results: [], next: "", previous: "" };

  it("делегирует (limit, offset, programId) в репозиторий", () => {
    setup();
    repo.fetchNews.and.returnValue(of(page));

    useCase.execute(10, 0, 1).subscribe();

    expect(repo.fetchNews).toHaveBeenCalledOnceWith(10, 0, 1);
  });

  it("при успехе возвращает ok с пагинацией", done => {
    setup();
    repo.fetchNews.and.returnValue(of(page));

    useCase.execute(10, 0, 1).subscribe(result => {
      expect(result.ok).toBeTrue();
      if (result.ok) expect(result.value).toBe(page);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'unknown' }", done => {
    setup();
    repo.fetchNews.and.returnValue(throwError(() => new Error("boom")));

    useCase.execute(10, 0, 1).subscribe(result => {
      expect(result.ok).toBeFalse();
      if (!result.ok) expect(result.error.kind).toBe("unknown");
      done();
    });
  });
});
