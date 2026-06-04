/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { HttpParams } from "@angular/common/http";
import { CreateProgramFiltersUseCase } from "./create-program-filters.use-case";
import { ProgramRepositoryPort } from "@domain/program/ports/program.repository.port";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { Project } from "@domain/project/project.model";

describe("CreateProgramFiltersUseCase", () => {
  let useCase: CreateProgramFiltersUseCase;
  let repo: any;

  function setup(): void {
    repo = { createProgramFilters: vi.fn() };
    TestBed.configureTestingModule({
      providers: [CreateProgramFiltersUseCase, { provide: ProgramRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(CreateProgramFiltersUseCase);
  }

  const page: ApiPagination<Project> = { count: 0, results: [], next: "", previous: "" };

  it("делегирует (programId, filters, params) в репозиторий", () => {
    setup();
    repo.createProgramFilters.mockReturnValue(of(page));
    const filters = { stack: ["ts"] };
    const params = new HttpParams();

    useCase.execute(1, filters, params).subscribe();

    expect(repo.createProgramFilters).toHaveBeenCalledExactlyOnceWith(1, filters, params);
  });

  it("при успехе возвращает ok с пагинацией проектов", () =>
    new Promise<void>(done => {
      setup();
      repo.createProgramFilters.mockReturnValue(of(page));

      useCase.execute(1, {}).subscribe(result => {
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.value).toBe(page);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'unknown' }", () =>
    new Promise<void>(done => {
      setup();
      repo.createProgramFilters.mockReturnValue(throwError(() => new Error("boom")));

      useCase.execute(1, {}).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.error.kind).toBe("unknown");
        done();
      });
    }));
});
