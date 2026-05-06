/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { GetProgramsUseCase } from "./get-programs.use-case";
import { ProgramRepositoryPort } from "@domain/program/ports/program.repository.port";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { Program } from "@domain/program/program.model";

describe("GetProgramsUseCase", () => {
  let useCase: GetProgramsUseCase;
  let repo: jasmine.SpyObj<ProgramRepositoryPort>;

  function setup(): void {
    repo = jasmine.createSpyObj<ProgramRepositoryPort>("ProgramRepositoryPort", ["getAll"]);
    TestBed.configureTestingModule({
      providers: [GetProgramsUseCase, { provide: ProgramRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(GetProgramsUseCase);
  }

  const page: ApiPagination<Program> = { count: 0, results: [], next: "", previous: "" };

  it("делегирует (skip, take) в репозиторий", () => {
    setup();
    repo.getAll.and.returnValue(of(page));

    useCase.execute(0, 10).subscribe();

    expect(repo.getAll).toHaveBeenCalledOnceWith(0, 10);
  });

  it("при успехе возвращает ok с пагинацией", done => {
    setup();
    repo.getAll.and.returnValue(of(page));

    useCase.execute(0, 10).subscribe(result => {
      expect(result.ok).toBeTrue();
      if (result.ok) expect(result.value).toBe(page);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'get_programs_error' } с cause", done => {
    setup();
    const err = new Error("boom");
    repo.getAll.and.returnValue(throwError(() => err));

    useCase.execute(0, 10).subscribe(result => {
      expect(result.ok).toBeFalse();
      if (!result.ok) {
        expect(result.error.kind).toBe("get_programs_error");
        expect(result.error.cause).toBe(err);
      }
      done();
    });
  });
});
