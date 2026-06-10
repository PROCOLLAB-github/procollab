/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { GetProgramFiltersUseCase } from "./get-program-filters.use-case";
import { ProgramRepositoryPort } from "@domain/program/ports/program.repository.port";
import { PartnerProgramFields } from "@domain/program/partner-program-fields.model";

describe("GetProgramFiltersUseCase", () => {
  let useCase: GetProgramFiltersUseCase;
  let repo: any;

  function setup(): void {
    repo = { getProgramFilters: vi.fn() };
    TestBed.configureTestingModule({
      providers: [GetProgramFiltersUseCase, { provide: ProgramRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(GetProgramFiltersUseCase);
  }

  it("делегирует programId в getProgramFilters", () => {
    setup();
    repo.getProgramFilters.mockReturnValue(of([]));

    useCase.execute(1).subscribe();

    expect(repo.getProgramFilters).toHaveBeenCalledExactlyOnceWith(1);
  });

  it("при успехе возвращает ok с массивом полей", () =>
    new Promise<void>(done => {
      setup();
      const fields: PartnerProgramFields[] = [];
      repo.getProgramFilters.mockReturnValue(of(fields));

      useCase.execute(1).subscribe(result => {
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.value).toBe(fields);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'get_program_filters_error' } с cause", () =>
    new Promise<void>(done => {
      setup();
      const err = new Error("boom");
      repo.getProgramFilters.mockReturnValue(throwError(() => err));

      useCase.execute(1).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.kind).toBe("get_program_filters_error");
          expect(result.error.cause).toBe(err);
        }
        done();
      });
    }));
});
