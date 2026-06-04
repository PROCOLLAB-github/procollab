/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { GetProgramUseCase } from "./get-program.use-case";
import { ProgramRepositoryPort } from "@domain/program/ports/program.repository.port";
import { Program } from "@domain/program/program.model";

describe("GetProgramUseCase", () => {
  let useCase: GetProgramUseCase;
  let repo: any;

  function setup(): void {
    repo = { getOne: vi.fn() };
    TestBed.configureTestingModule({
      providers: [GetProgramUseCase, { provide: ProgramRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(GetProgramUseCase);
  }

  it("делегирует programId в getOne", () => {
    setup();
    repo.getOne.mockReturnValue(of({} as Program));

    useCase.execute(1).subscribe();

    expect(repo.getOne).toHaveBeenCalledExactlyOnceWith(1);
  });

  it("при успехе возвращает ok с программой", () =>
    new Promise<void>(done => {
      setup();
      const program = { id: 1 } as Program;
      repo.getOne.mockReturnValue(of(program));

      useCase.execute(1).subscribe(result => {
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.value).toBe(program);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'get_program_error' } с cause", () =>
    new Promise<void>(done => {
      setup();
      const err = new Error("boom");
      repo.getOne.mockReturnValue(throwError(() => err));

      useCase.execute(1).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.kind).toBe("get_program_error");
          expect(result.error.cause).toBe(err);
        }
        done();
      });
    }));
});
