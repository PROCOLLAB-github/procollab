/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { HttpParams } from "@angular/common/http";
import { ParticipatingProgramUseCase } from "./participating-program.use-case";
import { ProgramRepositoryPort } from "@domain/program/ports/program.repository.port";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { Program } from "@domain/program/program.model";

describe("ParticipatingProgramUseCase", () => {
  let useCase: ParticipatingProgramUseCase;
  let repo: any;

  function setup(): void {
    repo = { getAll: vi.fn() };
    TestBed.configureTestingModule({
      providers: [ParticipatingProgramUseCase, { provide: ProgramRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(ParticipatingProgramUseCase);
  }

  const page: ApiPagination<Program> = { count: 0, results: [], next: "", previous: "" };

  it("делегирует в getAll с фиксированными (0, 20) и переданным фильтром", () => {
    setup();
    repo.getAll.mockReturnValue(of(page));
    const filter = new HttpParams();

    useCase.execute(filter).subscribe();

    expect(repo.getAll).toHaveBeenCalledExactlyOnceWith(0, 20, filter);
  });

  it("при успехе возвращает ok с пагинацией", () =>
    new Promise<void>(done => {
      setup();
      repo.getAll.mockReturnValue(of(page));

      useCase.execute().subscribe(result => {
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.value).toBe(page);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'unknown' }", () =>
    new Promise<void>(done => {
      setup();
      repo.getAll.mockReturnValue(throwError(() => new Error("boom")));

      useCase.execute().subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.error.kind).toBe("unknown");
        done();
      });
    }));
});
