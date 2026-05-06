/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { HttpParams } from "@angular/common/http";
import { GetProjectRatingsUseCase } from "./get-project-ratings.use-case";
import { ProjectRatingRepositoryPort } from "@domain/project/ports/project-rating.repository.port";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { ProjectRate } from "@domain/project/project-rate";

describe("GetProjectRatingsUseCase", () => {
  let useCase: GetProjectRatingsUseCase;
  let repo: jasmine.SpyObj<ProjectRatingRepositoryPort>;

  function setup(): void {
    repo = jasmine.createSpyObj<ProjectRatingRepositoryPort>("ProjectRatingRepositoryPort", [
      "getAll",
    ]);
    TestBed.configureTestingModule({
      providers: [
        GetProjectRatingsUseCase,
        { provide: ProjectRatingRepositoryPort, useValue: repo },
      ],
    });
    useCase = TestBed.inject(GetProjectRatingsUseCase);
  }

  const page: ApiPagination<ProjectRate> = { count: 0, results: [], next: "", previous: "" };

  it("делегирует (programId, params) в репозиторий", () => {
    setup();
    repo.getAll.and.returnValue(of(page));
    const params = new HttpParams();

    useCase.execute(1, params).subscribe();

    expect(repo.getAll).toHaveBeenCalledOnceWith(1, params);
  });

  it("при успехе возвращает ok с пагинацией", done => {
    setup();
    repo.getAll.and.returnValue(of(page));

    useCase.execute(1).subscribe(result => {
      expect(result.ok).toBeTrue();
      if (result.ok) expect(result.value).toBe(page);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'get_project_ratings_error' } с cause", done => {
    setup();
    const err = new Error("boom");
    repo.getAll.and.returnValue(throwError(() => err));

    useCase.execute(1).subscribe(result => {
      expect(result.ok).toBeFalse();
      if (!result.ok) {
        expect(result.error.kind).toBe("get_project_ratings_error");
        expect(result.error.cause).toBe(err);
      }
      done();
    });
  });
});
