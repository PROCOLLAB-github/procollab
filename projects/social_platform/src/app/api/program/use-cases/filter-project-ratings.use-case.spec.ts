/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { HttpParams } from "@angular/common/http";
import { FilterProjectRatingsUseCase } from "./filter-project-ratings.use-case";
import { ProjectRatingRepositoryPort } from "@domain/project/ports/project-rating.repository.port";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { ProjectRate } from "@domain/project/project-rate";

describe("FilterProjectRatingsUseCase", () => {
  let useCase: FilterProjectRatingsUseCase;
  let repo: jasmine.SpyObj<ProjectRatingRepositoryPort>;

  function setup(): void {
    repo = jasmine.createSpyObj<ProjectRatingRepositoryPort>("ProjectRatingRepositoryPort", [
      "postFilters",
    ]);
    TestBed.configureTestingModule({
      providers: [
        FilterProjectRatingsUseCase,
        { provide: ProjectRatingRepositoryPort, useValue: repo },
      ],
    });
    useCase = TestBed.inject(FilterProjectRatingsUseCase);
  }

  const page: ApiPagination<ProjectRate> = { count: 0, results: [], next: "", previous: "" };

  it("делегирует (programId, filters, params) в репозиторий", () => {
    setup();
    repo.postFilters.and.returnValue(of(page));
    const filters = { stack: ["ts"] };
    const params = new HttpParams();

    useCase.execute(1, filters, params).subscribe();

    expect(repo.postFilters).toHaveBeenCalledOnceWith(1, filters, params);
  });

  it("при успехе возвращает ok с пагинацией", done => {
    setup();
    repo.postFilters.and.returnValue(of(page));

    useCase.execute(1, {}).subscribe(result => {
      expect(result.ok).toBeTrue();
      if (result.ok) expect(result.value).toBe(page);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'filter_project_ratings_error' } с cause", done => {
    setup();
    const err = new Error("boom");
    repo.postFilters.and.returnValue(throwError(() => err));

    useCase.execute(1, {}).subscribe(result => {
      expect(result.ok).toBeFalse();
      if (!result.ok) {
        expect(result.error.kind).toBe("filter_project_ratings_error");
        expect(result.error.cause).toBe(err);
      }
      done();
    });
  });
});
