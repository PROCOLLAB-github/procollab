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
  let repo: any;

  const dto = { project: {} as Project, programFieldValues: [] } as ApplyToProgramDTO;
  const response: ApplyToProgramResponse = { projectId: 1, programLinkId: 2 };

  function setup(): void {
    repo = { applyProjectToProgram: vi.fn() };
    TestBed.configureTestingModule({
      providers: [ApplyProjectToProgramUseCase, { provide: ProgramRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(ApplyProjectToProgramUseCase);
  }

  it("делегирует (programId, dto) в репозиторий", () => {
    setup();
    repo.applyProjectToProgram.mockReturnValue(of(response));

    useCase.execute(1, dto).subscribe();

    expect(repo.applyProjectToProgram).toHaveBeenCalledExactlyOnceWith(1, dto);
  });

  it("при успехе возвращает ok с ответом репозитория", () =>
    new Promise<void>(done => {
      setup();
      repo.applyProjectToProgram.mockReturnValue(of(response));

      useCase.execute(1, dto).subscribe(result => {
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.value).toBe(response);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'apply_project_to_program_error' } с cause", () =>
    new Promise<void>(done => {
      setup();
      const err = new Error("boom");
      repo.applyProjectToProgram.mockReturnValue(throwError(() => err));

      useCase.execute(1, dto).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.kind).toBe("apply_project_to_program_error");
          expect(result.error.cause).toBe(err);
        }
        done();
      });
    }));
});
