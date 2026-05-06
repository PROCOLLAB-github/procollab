/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { GetProjectUseCase } from "./get-project.use-case";
import { ProjectRepositoryPort } from "@domain/project/ports/project.repository.port";
import { Project } from "@domain/project/project.model";

describe("GetProjectUseCase", () => {
  let useCase: GetProjectUseCase;
  let repo: jasmine.SpyObj<ProjectRepositoryPort>;

  function setup(): void {
    repo = jasmine.createSpyObj<ProjectRepositoryPort>("ProjectRepositoryPort", ["getOne"]);
    TestBed.configureTestingModule({
      providers: [GetProjectUseCase, { provide: ProjectRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(GetProjectUseCase);
  }

  it("делегирует (id) в getOne", () => {
    setup();
    repo.getOne.and.returnValue(of({} as Project));

    useCase.execute(1).subscribe();

    expect(repo.getOne).toHaveBeenCalledOnceWith(1);
  });

  it("при успехе возвращает ok с проектом", done => {
    setup();
    const project = {} as Project;
    repo.getOne.and.returnValue(of(project));

    useCase.execute(1).subscribe(result => {
      expect(result.ok).toBeTrue();
      if (result.ok) expect(result.value).toBe(project);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'get_project_error' } с cause", done => {
    setup();
    const err = new Error("boom");
    repo.getOne.and.returnValue(throwError(() => err));

    useCase.execute(1).subscribe(result => {
      expect(result.ok).toBeFalse();
      if (!result.ok) {
        expect(result.error.kind).toBe("get_project_error");
        expect(result.error.cause).toBe(err);
      }
      done();
    });
  });
});
