/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { RateProjectUseCase } from "./rate-project.use-case";
import { ProjectRatingRepositoryPort } from "@domain/project/ports/project-rating.repository.port";
import { ProjectRatingCriterion } from "@domain/project/project-rating-criterion";
import { ProjectRatingCriterionOutput } from "@domain/project/project-rating-criterion-output";

describe("RateProjectUseCase", () => {
  let useCase: RateProjectUseCase;
  let repo: any;

  function setup(): void {
    repo = { formValuesToDTO: vi.fn(), rate: vi.fn() };
    TestBed.configureTestingModule({
      providers: [RateProjectUseCase, { provide: ProjectRatingRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(RateProjectUseCase);
  }

  it("преобразует значения через formValuesToDTO и делегирует в rate", () => {
    setup();
    const criteria: ProjectRatingCriterion[] = [];
    const outputVals = { a: 5 };
    const dto: ProjectRatingCriterionOutput[] = [];
    repo.formValuesToDTO.mockReturnValue(dto);
    repo.rate.mockReturnValue(of(undefined));

    useCase.execute(1, criteria, outputVals).subscribe();

    expect(repo.formValuesToDTO).toHaveBeenCalledExactlyOnceWith(criteria, outputVals);
    expect(repo.rate).toHaveBeenCalledExactlyOnceWith(1, dto);
  });

  it("при успехе возвращает ok<void>", () =>
    new Promise<void>(done => {
      setup();
      repo.formValuesToDTO.mockReturnValue([]);
      repo.rate.mockReturnValue(of(undefined));

      useCase.execute(1, [], {}).subscribe(result => {
        expect(result.ok).toBe(true);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'rate_project_error' } с cause", () =>
    new Promise<void>(done => {
      setup();
      repo.formValuesToDTO.mockReturnValue([]);
      const err = new Error("boom");
      repo.rate.mockReturnValue(throwError(() => err));

      useCase.execute(1, [], {}).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.kind).toBe("rate_project_error");
          expect(result.error.cause).toBe(err);
        }
        done();
      });
    }));
});
