/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { GetProjectUseCase } from "./get-project.use-case";
import { ProjectRepositoryPort } from "@domain/project/ports/project.repository.port";
import { Project } from "@domain/project/project.model";

describe("GetProjectUseCase", () => {
  let useCase: GetProjectUseCase;
  let repo: any;

  function setup(): void {
    repo = { getOne: vi.fn() };
    TestBed.configureTestingModule({
      providers: [GetProjectUseCase, { provide: ProjectRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(GetProjectUseCase);
  }

  it("делегирует (id) в getOne", () => {
    setup();
    repo.getOne.mockReturnValue(of({} as Project));

    useCase.execute(1).subscribe();

    expect(repo.getOne).toHaveBeenCalledExactlyOnceWith(1);
  });

  it("при успехе возвращает ok с проектом", () =>
    new Promise<void>(done => {
      setup();
      const project = {} as Project;
      repo.getOne.mockReturnValue(of(project));

      useCase.execute(1).subscribe(result => {
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.value).toBe(project);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'get_project_error' } с cause", () =>
    new Promise<void>(done => {
      setup();
      const err = new Error("boom");
      repo.getOne.mockReturnValue(throwError(() => err));

      useCase.execute(1).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.kind).toBe("get_project_error");
          expect(result.error.cause).toBe(err);
        }
        done();
      });
    }));
});
