/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { SubmitCompetitiveProjectUseCase } from "./submit-competitive-project.use-case";
import { ProgramRepositoryPort } from "@domain/program/ports/program.repository.port";
import { Project } from "@domain/project/project.model";

describe("SubmitCompetitiveProjectUseCase", () => {
  let useCase: SubmitCompetitiveProjectUseCase;
  let repo: any;

  function setup(): void {
    repo = { submitCompettetiveProject: vi.fn() };
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
    repo.submitCompettetiveProject.mockReturnValue(of({} as Project));

    useCase.execute(1).subscribe();

    expect(repo.submitCompettetiveProject).toHaveBeenCalledExactlyOnceWith(1);
  });

  it("при успехе возвращает ok с проектом", () =>
    new Promise<void>(done => {
      setup();
      const project = {} as Project;
      repo.submitCompettetiveProject.mockReturnValue(of(project));

      useCase.execute(1).subscribe(result => {
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.value).toBe(project);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'submit_competitive_project_error' } с cause", () =>
    new Promise<void>(done => {
      setup();
      const err = new Error("boom");
      repo.submitCompettetiveProject.mockReturnValue(throwError(() => err));

      useCase.execute(1).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.kind).toBe("submit_competitive_project_error");
          expect(result.error.cause).toBe(err);
        }
        done();
      });
    }));
});
