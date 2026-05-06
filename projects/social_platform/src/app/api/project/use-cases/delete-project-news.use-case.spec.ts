/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { DeleteProjectNewsUseCase } from "./delete-project-news.use-case";
import { ProjectNewsRepositoryPort } from "@domain/project/ports/project-news.repository.port";

describe("DeleteProjectNewsUseCase", () => {
  let useCase: DeleteProjectNewsUseCase;
  let repo: jasmine.SpyObj<ProjectNewsRepositoryPort>;

  function setup(): void {
    repo = jasmine.createSpyObj<ProjectNewsRepositoryPort>("ProjectNewsRepositoryPort", ["delete"]);
    TestBed.configureTestingModule({
      providers: [DeleteProjectNewsUseCase, { provide: ProjectNewsRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(DeleteProjectNewsUseCase);
  }

  it("делегирует (projectId, newsId) в delete", () => {
    setup();
    repo.delete.and.returnValue(of(undefined));

    useCase.execute("p1", 42).subscribe();

    expect(repo.delete).toHaveBeenCalledOnceWith("p1", 42);
  });

  it("при успехе возвращает ok с удалённым newsId", done => {
    setup();
    repo.delete.and.returnValue(of(undefined));

    useCase.execute("p1", 42).subscribe(result => {
      expect(result.ok).toBeTrue();
      if (result.ok) expect(result.value).toBe(42);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'delete_project_news_error' } с cause", done => {
    setup();
    const err = new Error("boom");
    repo.delete.and.returnValue(throwError(() => err));

    useCase.execute("p1", 42).subscribe(result => {
      expect(result.ok).toBeFalse();
      if (!result.ok) {
        expect(result.error.kind).toBe("delete_project_news_error");
        expect(result.error.cause).toBe(err);
      }
      done();
    });
  });
});
