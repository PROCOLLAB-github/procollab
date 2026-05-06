/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { HttpParams } from "@angular/common/http";
import { ProjectRatingRepository } from "./project-rating.repository";
import { ProjectRatingHttpAdapter } from "../../adapters/project/project-rating-http.adapter";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { ProjectRate } from "@domain/project/project-rate";
import { ProjectRatingCriterion } from "@domain/project/project-rating-criterion";
import { ProjectRatingCriterionOutput } from "@domain/project/project-rating-criterion-output";

describe("ProjectRatingRepository", () => {
  let repository: ProjectRatingRepository;
  let adapter: jasmine.SpyObj<ProjectRatingHttpAdapter>;

  function setup(): void {
    adapter = jasmine.createSpyObj<ProjectRatingHttpAdapter>("ProjectRatingHttpAdapter", [
      "getAll",
      "postFilters",
      "rate",
    ]);
    TestBed.configureTestingModule({
      providers: [
        ProjectRatingRepository,
        { provide: ProjectRatingHttpAdapter, useValue: adapter },
      ],
    });
    repository = TestBed.inject(ProjectRatingRepository);
  }

  const page = (): ApiPagination<ProjectRate> => ({
    count: 0,
    results: [],
    next: "",
    previous: "",
  });

  it("getAll делегирует в adapter", () => {
    setup();
    const params = new HttpParams();
    adapter.getAll.and.returnValue(of(page()));
    repository.getAll(5, params).subscribe();
    expect(adapter.getAll).toHaveBeenCalledOnceWith(5, params);
  });

  it("postFilters делегирует в adapter", () => {
    setup();
    const params = new HttpParams();
    adapter.postFilters.and.returnValue(of(page()));
    repository.postFilters(5, { status: ["open"] }, params).subscribe();
    expect(adapter.postFilters).toHaveBeenCalledOnceWith(5, { status: ["open"] }, params);
  });

  it("rate делегирует в adapter", () => {
    setup();
    const scores = [] as ProjectRatingCriterionOutput[];
    adapter.rate.and.returnValue(of(undefined));
    repository.rate(42, scores).subscribe();
    expect(adapter.rate).toHaveBeenCalledOnceWith(42, scores);
  });

  it("formValuesToDTO приводит boolean к капитализированной строке", () => {
    setup();
    const criteria = [{ id: 1, type: "bool" }] as unknown as ProjectRatingCriterion[];

    const out = repository.formValuesToDTO(criteria, { 1: true });

    expect(out).toEqual([{ criterionId: 1, value: "True" }]);
  });

  it("formValuesToDTO приводит int-критерии к числу", () => {
    setup();
    const criteria = [{ id: 2, type: "int" }] as unknown as ProjectRatingCriterion[];

    const out = repository.formValuesToDTO(criteria, { 2: "5" });

    expect(out).toEqual([{ criterionId: 2, value: 5 }]);
  });

  it("formValuesToDTO оставляет строковые значения для не-int/не-bool критериев", () => {
    setup();
    const criteria = [{ id: 3, type: "text" }] as unknown as ProjectRatingCriterion[];

    const out = repository.formValuesToDTO(criteria, { 3: "hello" });

    expect(out).toEqual([{ criterionId: 3, value: "hello" }]);
  });
});
