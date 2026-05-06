/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { AddProjectNewsUseCase } from "./add-project-news.use-case";
import { ProjectNewsRepositoryPort } from "@domain/project/ports/project-news.repository.port";
import { FeedNews } from "@domain/project/project-news.model";

describe("AddProjectNewsUseCase", () => {
  let useCase: AddProjectNewsUseCase;
  let repo: jasmine.SpyObj<ProjectNewsRepositoryPort>;

  function setup(): void {
    repo = jasmine.createSpyObj<ProjectNewsRepositoryPort>("ProjectNewsRepositoryPort", [
      "addNews",
    ]);
    TestBed.configureTestingModule({
      providers: [AddProjectNewsUseCase, { provide: ProjectNewsRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(AddProjectNewsUseCase);
  }

  it("делегирует (projectId, {text, files}) в репозиторий", () => {
    setup();
    repo.addNews.and.returnValue(of({} as FeedNews));
    const news = { text: "hi", files: ["f"] };

    useCase.execute("p1", news).subscribe();

    expect(repo.addNews).toHaveBeenCalledOnceWith("p1", news);
  });

  it("при успехе возвращает ok с созданной новостью", done => {
    setup();
    const created = { id: 42 } as FeedNews;
    repo.addNews.and.returnValue(of(created));

    useCase.execute("p1", { text: "hi", files: [] }).subscribe(result => {
      expect(result.ok).toBeTrue();
      if (result.ok) expect(result.value).toBe(created);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'add_project_news_error' } с cause", done => {
    setup();
    const err = new Error("boom");
    repo.addNews.and.returnValue(throwError(() => err));

    useCase.execute("p1", { text: "hi", files: [] }).subscribe(result => {
      expect(result.ok).toBeFalse();
      if (!result.ok) {
        expect(result.error.kind).toBe("add_project_news_error");
        expect(result.error.cause).toBe(err);
      }
      done();
    });
  });
});
