/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { GetActualProgramsUseCase } from "./get-actual-programs.use-case";
import { ProgramRepositoryPort } from "@domain/program/ports/program.repository.port";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { Program } from "@domain/program/program.model";

describe("GetActualProgramsUseCase", () => {
  let useCase: GetActualProgramsUseCase;
  let repo: jasmine.SpyObj<ProgramRepositoryPort>;

  function setup(): void {
    repo = jasmine.createSpyObj<ProgramRepositoryPort>("ProgramRepositoryPort", [
      "getActualPrograms",
    ]);
    TestBed.configureTestingModule({
      providers: [GetActualProgramsUseCase, { provide: ProgramRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(GetActualProgramsUseCase);
  }

  const page: ApiPagination<Program> = { count: 0, results: [], next: "", previous: "" };

  it("делегирует вызов в getActualPrograms без аргументов", () => {
    setup();
    repo.getActualPrograms.and.returnValue(of(page));

    useCase.execute().subscribe();

    expect(repo.getActualPrograms).toHaveBeenCalledOnceWith();
  });

  it("при успехе возвращает ok с пагинацией", done => {
    setup();
    repo.getActualPrograms.and.returnValue(of(page));

    useCase.execute().subscribe(result => {
      expect(result.ok).toBeTrue();
      if (result.ok) expect(result.value).toBe(page);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'get_actual_programs_error' } с cause", done => {
    setup();
    const err = new Error("boom");
    repo.getActualPrograms.and.returnValue(throwError(() => err));

    useCase.execute().subscribe(result => {
      expect(result.ok).toBeFalse();
      if (!result.ok) {
        expect(result.error.kind).toBe("get_actual_programs_error");
        expect(result.error.cause).toBe(err);
      }
      done();
    });
  });
});
