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
  let repo: any;

  function setup(): void {
    repo = { postFilters: vi.fn() };
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
    repo.postFilters.mockReturnValue(of(page));
    const filters = { stack: ["ts"] };
    const params = new HttpParams();

    useCase.execute(1, filters, params).subscribe();

    expect(repo.postFilters).toHaveBeenCalledExactlyOnceWith(1, filters, params);
  });

  it("при успехе возвращает ok с пагинацией", () =>
    new Promise<void>(done => {
      setup();
      repo.postFilters.mockReturnValue(of(page));

      useCase.execute(1, {}).subscribe(result => {
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.value).toBe(page);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'filter_project_ratings_error' } с cause", () =>
    new Promise<void>(done => {
      setup();
      const err = new Error("boom");
      repo.postFilters.mockReturnValue(throwError(() => err));

      useCase.execute(1, {}).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.kind).toBe("filter_project_ratings_error");
          expect(result.error.cause).toBe(err);
        }
        done();
      });
    }));
});
