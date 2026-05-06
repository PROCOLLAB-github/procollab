/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { HttpParams } from "@angular/common/http";
import { ApiService } from "@corelib";
import { ProjectRatingHttpAdapter } from "./project-rating-http.adapter";
import { ProjectRate } from "@domain/project/project-rate";
import { ProjectRatingCriterionOutput } from "@domain/project/project-rating-criterion-output";

describe("ProjectRatingHttpAdapter", () => {
  let adapter: ProjectRatingHttpAdapter;
  let api: jasmine.SpyObj<ApiService>;

  function setup(): void {
    api = jasmine.createSpyObj<ApiService>("ApiService", ["get", "post"]);
    TestBed.configureTestingModule({
      providers: [ProjectRatingHttpAdapter, { provide: ApiService, useValue: api }],
    });
    adapter = TestBed.inject(ProjectRatingHttpAdapter);
  }

  const pagination: () => {
    count: number;
    results: ProjectRate[];
    next: string;
    previous: string;
  } = () => ({ count: 0, results: [], next: "", previous: "" });

  it("getAll идёт в GET /rate-project/:programId c params", () => {
    setup();
    api.get.and.returnValue(of(pagination()));
    const params = new HttpParams().set("limit", "10");

    adapter.getAll(5, params).subscribe();

    expect(api.get).toHaveBeenCalledOnceWith("/rate-project/5", params);
  });

  it("postFilters идёт в POST /rate-project/:programId c query и body", () => {
    setup();
    api.post.and.returnValue(of(pagination()));
    const params = new HttpParams().set("limit", "10");

    adapter.postFilters(5, { status: ["open"] }, params).subscribe();

    expect(api.post).toHaveBeenCalledOnceWith("/rate-project/5?limit=10", {
      filters: { status: ["open"] },
    });
  });

  it("postFilters без params не добавляет query", () => {
    setup();
    api.post.and.returnValue(of(pagination()));

    adapter.postFilters(5, {}).subscribe();

    expect(api.post).toHaveBeenCalledOnceWith("/rate-project/5", { filters: {} });
  });

  it("rate идёт в POST /rate-project/rate/:projectId c массивом оценок", () => {
    setup();
    api.post.and.returnValue(of(undefined));
    const scores = [] as ProjectRatingCriterionOutput[];

    adapter.rate(42, scores).subscribe();

    expect(api.post).toHaveBeenCalledOnceWith("/rate-project/rate/42", scores);
  });
});
