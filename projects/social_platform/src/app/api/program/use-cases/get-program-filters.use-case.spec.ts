/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { GetProgramFiltersUseCase } from "./get-program-filters.use-case";
import { ProgramRepositoryPort } from "@domain/program/ports/program.repository.port";
import { PartnerProgramFields } from "@domain/program/partner-program-fields.model";

describe("GetProgramFiltersUseCase", () => {
  let useCase: GetProgramFiltersUseCase;
  let repo: jasmine.SpyObj<ProgramRepositoryPort>;

  function setup(): void {
    repo = jasmine.createSpyObj<ProgramRepositoryPort>("ProgramRepositoryPort", [
      "getProgramFilters",
    ]);
    TestBed.configureTestingModule({
      providers: [GetProgramFiltersUseCase, { provide: ProgramRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(GetProgramFiltersUseCase);
  }

  it("делегирует programId в getProgramFilters", () => {
    setup();
    repo.getProgramFilters.and.returnValue(of([]));

    useCase.execute(1).subscribe();

    expect(repo.getProgramFilters).toHaveBeenCalledOnceWith(1);
  });

  it("при успехе возвращает ok с массивом полей", done => {
    setup();
    const fields: PartnerProgramFields[] = [];
    repo.getProgramFilters.and.returnValue(of(fields));

    useCase.execute(1).subscribe(result => {
      expect(result.ok).toBeTrue();
      if (result.ok) expect(result.value).toBe(fields);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'get_program_filters_error' } с cause", done => {
    setup();
    const err = new Error("boom");
    repo.getProgramFilters.and.returnValue(throwError(() => err));

    useCase.execute(1).subscribe(result => {
      expect(result.ok).toBeFalse();
      if (!result.ok) {
        expect(result.error.kind).toBe("get_program_filters_error");
        expect(result.error.cause).toBe(err);
      }
      done();
    });
  });
});
