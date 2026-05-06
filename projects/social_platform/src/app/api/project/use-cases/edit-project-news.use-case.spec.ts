/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { EditProjectNewsUseCase } from "./edit-project-news.use-case";
import { ProjectNewsRepositoryPort } from "@domain/project/ports/project-news.repository.port";
import { FeedNews } from "@domain/project/project-news.model";

describe("EditProjectNewsUseCase", () => {
  let useCase: EditProjectNewsUseCase;
  let repo: jasmine.SpyObj<ProjectNewsRepositoryPort>;

  function setup(): void {
    repo = jasmine.createSpyObj<ProjectNewsRepositoryPort>("ProjectNewsRepositoryPort", [
      "editNews",
    ]);
    TestBed.configureTestingModule({
      providers: [EditProjectNewsUseCase, { provide: ProjectNewsRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(EditProjectNewsUseCase);
  }

  it("делегирует (projectId, newsId, patch) в editNews", () => {
    setup();
    repo.editNews.and.returnValue(of({} as FeedNews));
    const patch: Partial<FeedNews> = { text: "new" };

    useCase.execute("p1", 42, patch).subscribe();

    expect(repo.editNews).toHaveBeenCalledOnceWith("p1", 42, patch);
  });

  it("при успехе возвращает ok с обновлённой новостью", done => {
    setup();
    const news = { id: 42 } as FeedNews;
    repo.editNews.and.returnValue(of(news));

    useCase.execute("p1", 42, {}).subscribe(result => {
      expect(result.ok).toBeTrue();
      if (result.ok) expect(result.value).toBe(news);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'edit_project_news_error' } с cause", done => {
    setup();
    const err = new Error("boom");
    repo.editNews.and.returnValue(throwError(() => err));

    useCase.execute("p1", 42, {}).subscribe(result => {
      expect(result.ok).toBeFalse();
      if (!result.ok) {
        expect(result.error.kind).toBe("edit_project_news_error");
        expect(result.error.cause).toBe(err);
      }
      done();
    });
  });
});
