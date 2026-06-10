/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { AddNewsUseCase } from "./add-news.use-case";
import {
  NewsRepositoryPort,
  PROGRAM_NEWS_REPOSITORY,
} from "@domain/news/port/news.repository.port";
import { FeedNews } from "@domain/news/project-news.model";

describe("AddNewsUseCase", () => {
  let useCase: AddNewsUseCase;
  let repo: any;

  function setup(): void {
    repo = { addNews: vi.fn() };
    TestBed.configureTestingModule({
      providers: [AddNewsUseCase, { provide: PROGRAM_NEWS_REPOSITORY, useValue: repo }],
    });
    useCase = TestBed.inject(AddNewsUseCase);
  }

  it("делегирует (programId, {text, files}) в репозиторий", () => {
    setup();
    repo.addNews.mockReturnValue(of({} as FeedNews));

    useCase.execute(1, { text: "hi", files: ["f"] }).subscribe();

    expect(repo.addNews).toHaveBeenCalledExactlyOnceWith("1", { text: "hi", files: ["f"] });
  });

  it("при успехе возвращает ok с созданной новостью", () =>
    new Promise<void>(done => {
      setup();
      const news = { id: 10 } as FeedNews;
      repo.addNews.mockReturnValue(of(news));

      useCase.execute(1, { text: "hi", files: [] }).subscribe(result => {
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.value).toBe(news);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'unknown' }", () =>
    new Promise<void>(done => {
      setup();
      repo.addNews.mockReturnValue(throwError(() => new Error("boom")));

      useCase.execute(1, { text: "hi", files: [] }).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.error.kind).toBe("unknown");
        done();
      });
    }));
});
