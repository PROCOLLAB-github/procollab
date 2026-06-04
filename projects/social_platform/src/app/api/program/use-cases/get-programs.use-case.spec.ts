/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { GetProgramsUseCase } from "./get-programs.use-case";
import { ProgramRepositoryPort } from "@domain/program/ports/program.repository.port";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { Program } from "@domain/program/program.model";

describe("GetProgramsUseCase", () => {
  let useCase: GetProgramsUseCase;
  let repo: any;

  function setup(): void {
    repo = { getAll: vi.fn() };
    TestBed.configureTestingModule({
      providers: [GetProgramsUseCase, { provide: ProgramRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(GetProgramsUseCase);
  }

  const page: ApiPagination<Program> = { count: 0, results: [], next: "", previous: "" };

  it("делегирует (skip, take) в репозиторий", () => {
    setup();
    repo.getAll.mockReturnValue(of(page));

    useCase.execute(0, 10).subscribe();

    expect(repo.getAll).toHaveBeenCalledExactlyOnceWith(0, 10);
  });

  it("при успехе возвращает ok с пагинацией", () =>
    new Promise<void>(done => {
      setup();
      repo.getAll.mockReturnValue(of(page));

      useCase.execute(0, 10).subscribe(result => {
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.value).toBe(page);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'get_programs_error' } с cause", () =>
    new Promise<void>(done => {
      setup();
      const err = new Error("boom");
      repo.getAll.mockReturnValue(throwError(() => err));

      useCase.execute(0, 10).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.kind).toBe("get_programs_error");
          expect(result.error.cause).toBe(err);
        }
        done();
      });
    }));
});
