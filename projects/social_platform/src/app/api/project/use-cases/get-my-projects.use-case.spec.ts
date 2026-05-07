/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { HttpParams } from "@angular/common/http";
import { GetMyProjectsUseCase } from "./get-my-projects.use-case";
import { ProjectRepositoryPort } from "@domain/project/ports/project.repository.port";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { Project } from "@domain/project/project.model";

describe("GetMyProjectsUseCase", () => {
  let useCase: GetMyProjectsUseCase;
  let repo: jasmine.SpyObj<ProjectRepositoryPort>;

  function setup(): void {
    repo = jasmine.createSpyObj<ProjectRepositoryPort>("ProjectRepositoryPort", ["getMy"]);
    TestBed.configureTestingModule({
      providers: [GetMyProjectsUseCase, { provide: ProjectRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(GetMyProjectsUseCase);
  }

  const page: ApiPagination<Project> = { count: 0, results: [], next: "", previous: "" };

  it("делегирует params в getMy", () => {
    setup();
    repo.getMy.and.returnValue(of(page));
    const params = new HttpParams();

    useCase.execute(params).subscribe();

    expect(repo.getMy).toHaveBeenCalledOnceWith(params);
  });

  it("при успехе возвращает ok с пагинацией", done => {
    setup();
    repo.getMy.and.returnValue(of(page));

    useCase.execute().subscribe(result => {
      expect(result.ok).toBeTrue();
      if (result.ok) expect(result.value).toBe(page);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'unknown' }", done => {
    setup();
    repo.getMy.and.returnValue(throwError(() => new Error("boom")));

    useCase.execute().subscribe(result => {
      expect(result.ok).toBeFalse();
      if (!result.ok) expect(result.error.kind).toBe("unknown");
      done();
    });
  });
});
