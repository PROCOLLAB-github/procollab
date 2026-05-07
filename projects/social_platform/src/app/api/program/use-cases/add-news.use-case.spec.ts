/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { AddNewsUseCase } from "./add-news.use-case";
import { ProgramNewsRepositoryPort } from "@domain/program/ports/program-news.repository.port";
import { FeedNews } from "@domain/project/project-news.model";

describe("AddNewsUseCase", () => {
  let useCase: AddNewsUseCase;
  let repo: jasmine.SpyObj<ProgramNewsRepositoryPort>;

  function setup(): void {
    repo = jasmine.createSpyObj<ProgramNewsRepositoryPort>("ProgramNewsRepositoryPort", [
      "addNews",
    ]);
    TestBed.configureTestingModule({
      providers: [AddNewsUseCase, { provide: ProgramNewsRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(AddNewsUseCase);
  }

  it("делегирует (programId, {text, files}) в репозиторий", () => {
    setup();
    repo.addNews.and.returnValue(of({} as FeedNews));

    useCase.execute(1, { text: "hi", files: ["f"] }).subscribe();

    expect(repo.addNews).toHaveBeenCalledOnceWith(1, { text: "hi", files: ["f"] });
  });

  it("при успехе возвращает ok с созданной новостью", done => {
    setup();
    const news = { id: 10 } as FeedNews;
    repo.addNews.and.returnValue(of(news));

    useCase.execute(1, { text: "hi", files: [] }).subscribe(result => {
      expect(result.ok).toBeTrue();
      if (result.ok) expect(result.value).toBe(news);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'unknown' }", done => {
    setup();
    repo.addNews.and.returnValue(throwError(() => new Error("boom")));

    useCase.execute(1, { text: "hi", files: [] }).subscribe(result => {
      expect(result.ok).toBeFalse();
      if (!result.ok) expect(result.error.kind).toBe("unknown");
      done();
    });
  });
});
