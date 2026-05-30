/** @format */

import { TestBed } from "@angular/core/testing";
import { ApplyProjectToProgramUseCase } from "./apply-project-to-program.use-case";
import { ProgramRepositoryPort } from "@domain/program/ports/program.repository.port";
import { ApplyToProgramDTO } from "@domain/program/dto/apply-to-program.model";
import { ApplyToProgramResponse } from "@domain/program/results/apply-to-program";
import { Project } from "@domain/project/project.model";
import { of, throwError } from "rxjs";

describe("ApplyProjectToProgramUseCase", () => {
  let useCase: ApplyProjectToProgramUseCase;
  let repo: jasmine.SpyObj<ProgramRepositoryPort>;

  const dto = { project: {} as Project, programFieldValues: [] } as ApplyToProgramDTO;
  const response: ApplyToProgramResponse = { projectId: 1, programLinkId: 2 };

  function setup(): void {
    repo = jasmine.createSpyObj<ProgramRepositoryPort>("ProgramRepositoryPort", [
      "applyProjectToProgram",
    ]);
    TestBed.configureTestingModule({
      providers: [ApplyProjectToProgramUseCase, { provide: ProgramRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(ApplyProjectToProgramUseCase);
  }

  it("делегирует (programId, dto) в репозиторий", () => {
    setup();
    repo.applyProjectToProgram.and.returnValue(of(response));

    useCase.execute(1, dto).subscribe();

    expect(repo.applyProjectToProgram).toHaveBeenCalledOnceWith(1, dto);
  });

  it("при успехе возвращает ok с ответом репозитория", done => {
    setup();
    repo.applyProjectToProgram.and.returnValue(of(response));

    useCase.execute(1, dto).subscribe(result => {
      expect(result.ok).toBeTrue();
      if (result.ok) expect(result.value).toBe(response);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'apply_project_to_program_error' } с cause", done => {
    setup();
    const err = new Error("boom");
    repo.applyProjectToProgram.and.returnValue(throwError(() => err));

    useCase.execute(1, dto).subscribe(result => {
      expect(result.ok).toBeFalse();
      if (!result.ok) {
        expect(result.error.kind).toBe("apply_project_to_program_error");
        expect(result.error.cause).toBe(err);
      }
      done();
    });
  });
});
