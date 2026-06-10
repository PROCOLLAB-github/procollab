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
  let repo: any;

  function setup(): void {
    repo = { getMy: vi.fn() };
    TestBed.configureTestingModule({
      providers: [GetMyProjectsUseCase, { provide: ProjectRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(GetMyProjectsUseCase);
  }

  const page: ApiPagination<Project> = { count: 0, results: [], next: "", previous: "" };

  it("делегирует params в getMy", () => {
    setup();
    repo.getMy.mockReturnValue(of(page));
    const params = new HttpParams();

    useCase.execute(params).subscribe();

    expect(repo.getMy).toHaveBeenCalledExactlyOnceWith(params);
  });

  it("при успехе возвращает ok с пагинацией", () =>
    new Promise<void>(done => {
      setup();
      repo.getMy.mockReturnValue(of(page));

      useCase.execute().subscribe(result => {
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.value).toBe(page);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'unknown' }", () =>
    new Promise<void>(done => {
      setup();
      repo.getMy.mockReturnValue(throwError(() => new Error("boom")));

      useCase.execute().subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.error.kind).toBe("unknown");
        done();
      });
    }));
});
