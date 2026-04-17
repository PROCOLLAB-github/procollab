/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { SubmitCompetitiveProjectUseCase } from "./submit-competitive-project.use-case";
import { ProgramRepositoryPort } from "@domain/program/ports/program.repository.port";
import { Project } from "@domain/project/project.model";

describe("SubmitCompetitiveProjectUseCase", () => {
  let useCase: SubmitCompetitiveProjectUseCase;
  let repo: jasmine.SpyObj<ProgramRepositoryPort>;

  function setup(): void {
    repo = jasmine.createSpyObj<ProgramRepositoryPort>("ProgramRepositoryPort", [
      "submitCompettetiveProject",
    ]);
    TestBed.configureTestingModule({
      providers: [
        SubmitCompetitiveProjectUseCase,
        { provide: ProgramRepositoryPort, useValue: repo },
      ],
    });
    useCase = TestBed.inject(SubmitCompetitiveProjectUseCase);
  }

  it("делегирует (relationId) в submitCompettetiveProject", () => {
    setup();
    repo.submitCompettetiveProject.and.returnValue(of({} as Project));

    useCase.execute(1).subscribe();

    expect(repo.submitCompettetiveProject).toHaveBeenCalledOnceWith(1);
  });

  it("при успехе возвращает ok с проектом", done => {
    setup();
    const project = {} as Project;
    repo.submitCompettetiveProject.and.returnValue(of(project));

    useCase.execute(1).subscribe(result => {
      expect(result.ok).toBeTrue();
      if (result.ok) expect(result.value).toBe(project);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'submit_competitive_project_error' } с cause", done => {
    setup();
    const err = new Error("boom");
    repo.submitCompettetiveProject.and.returnValue(throwError(() => err));

    useCase.execute(1).subscribe(result => {
      expect(result.ok).toBeFalse();
      if (!result.ok) {
        expect(result.error.kind).toBe("submit_competitive_project_error");
        expect(result.error.cause).toBe(err);
      }
      done();
    });
  });
});
