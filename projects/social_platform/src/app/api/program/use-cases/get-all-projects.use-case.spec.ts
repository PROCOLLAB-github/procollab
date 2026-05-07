/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { HttpParams } from "@angular/common/http";
import { GetAllProjectsUseCase } from "./get-all-projects.use-case";
import { ProgramRepositoryPort } from "@domain/program/ports/program.repository.port";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { Project } from "@domain/project/project.model";

describe("GetAllProjectsUseCase", () => {
  let useCase: GetAllProjectsUseCase;
  let repo: jasmine.SpyObj<ProgramRepositoryPort>;

  function setup(): void {
    repo = jasmine.createSpyObj<ProgramRepositoryPort>("ProgramRepositoryPort", ["getAllProjects"]);
    TestBed.configureTestingModule({
      providers: [GetAllProjectsUseCase, { provide: ProgramRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(GetAllProjectsUseCase);
  }

  const page: ApiPagination<Project> = { count: 0, results: [], next: "", previous: "" };

  it("делегирует (programId, params) в репозиторий", () => {
    setup();
    repo.getAllProjects.and.returnValue(of(page));
    const params = new HttpParams();

    useCase.execute(1, params).subscribe();

    expect(repo.getAllProjects).toHaveBeenCalledOnceWith(1, params);
  });

  it("при успехе возвращает ok с пагинацией проектов", done => {
    setup();
    repo.getAllProjects.and.returnValue(of(page));

    useCase.execute(1).subscribe(result => {
      expect(result.ok).toBeTrue();
      if (result.ok) expect(result.value).toBe(page);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'unknown' }", done => {
    setup();
    repo.getAllProjects.and.returnValue(throwError(() => new Error("boom")));

    useCase.execute(1).subscribe(result => {
      expect(result.ok).toBeFalse();
      if (!result.ok) expect(result.error.kind).toBe("unknown");
      done();
    });
  });
});
