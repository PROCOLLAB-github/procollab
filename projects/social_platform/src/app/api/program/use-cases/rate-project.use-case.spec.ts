/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { RateProjectUseCase } from "./rate-project.use-case";
import { ProjectRatingRepositoryPort } from "@domain/project/ports/project-rating.repository.port";
import { ProjectRatingCriterion } from "@domain/project/project-rating-criterion";
import { ProjectRatingCriterionOutput } from "@domain/project/project-rating-criterion-output";

describe("RateProjectUseCase", () => {
  let useCase: RateProjectUseCase;
  let repo: jasmine.SpyObj<ProjectRatingRepositoryPort>;

  function setup(): void {
    repo = jasmine.createSpyObj<ProjectRatingRepositoryPort>("ProjectRatingRepositoryPort", [
      "formValuesToDTO",
      "rate",
    ]);
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
    repo.formValuesToDTO.and.returnValue(dto);
    repo.rate.and.returnValue(of(undefined));

    useCase.execute(1, criteria, outputVals).subscribe();

    expect(repo.formValuesToDTO).toHaveBeenCalledOnceWith(criteria, outputVals);
    expect(repo.rate).toHaveBeenCalledOnceWith(1, dto);
  });

  it("при успехе возвращает ok<void>", done => {
    setup();
    repo.formValuesToDTO.and.returnValue([]);
    repo.rate.and.returnValue(of(undefined));

    useCase.execute(1, [], {}).subscribe(result => {
      expect(result.ok).toBeTrue();
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'rate_project_error' } с cause", done => {
    setup();
    repo.formValuesToDTO.and.returnValue([]);
    const err = new Error("boom");
    repo.rate.and.returnValue(throwError(() => err));

    useCase.execute(1, [], {}).subscribe(result => {
      expect(result.ok).toBeFalse();
      if (!result.ok) {
        expect(result.error.kind).toBe("rate_project_error");
        expect(result.error.cause).toBe(err);
      }
      done();
    });
  });
});
