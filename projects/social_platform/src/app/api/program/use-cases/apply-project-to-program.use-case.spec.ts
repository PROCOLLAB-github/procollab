/** @format */

import { TestBed } from "@angular/core/testing";
import { ApplyProjectToProgramUseCase } from "./apply-project-to-program.use-case";
import { ProgramRepositoryPort } from "@domain/program/ports/program.repository.port";
import { of, throwError } from "rxjs";

describe("ApplyProjectToProgramUseCase", () => {
  let useCase: ApplyProjectToProgramUseCase;
  let repo: jasmine.SpyObj<ProgramRepositoryPort>;

  function setup(): void {
    repo = jasmine.createSpyObj<ProgramRepositoryPort>("ProgramRepositoryPort", [
      "applyProjectToProgram",
    ]);
    TestBed.configureTestingModule({
      providers: [ApplyProjectToProgramUseCase, { provide: ProgramRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(ApplyProjectToProgramUseCase);
  }

  it("делегирует (programId, body) в репозиторий", () => {
    setup();
    repo.applyProjectToProgram.and.returnValue(of({}));
    const body = { id: 1, name: "proj 1", files: [""] };

    useCase.execute(1, body).subscribe();

    expect(repo.applyProjectToProgram).toHaveBeenCalledOnceWith(1, body);
  });

  it("при успехе возвращает ok с поданным проектом", done => {
    setup();
    const project = { id: 1, name: "proj 1" };
    repo.applyProjectToProgram.and.returnValue(of(project));

    useCase.execute(1, project).subscribe(result => {
      expect(result.ok).toBeTrue();
      if (result.ok) expect(result.value).toBe(project);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'apply_project_to_program_error' } с cause", done => {
    setup();
    const err = new Error("boom");
    repo.applyProjectToProgram.and.returnValue(throwError(() => err));

    useCase.execute(1, {}).subscribe(result => {
      expect(result.ok).toBeFalse();
      if (!result.ok) {
        expect(result.error.kind).toBe("apply_project_to_program_error");
        expect(result.error.cause).toBe(err);
      }
      done();
    });
  });
});
