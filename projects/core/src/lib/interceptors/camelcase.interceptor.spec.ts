/** @format */

import { TestBed } from "@angular/core/testing";
import { HttpRequest, HttpResponse } from "@angular/common/http";
import { of } from "rxjs";

import { CamelcaseInterceptor } from "./camelcase.interceptor";

describe("CamelcaseInterceptor", () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [CamelcaseInterceptor],
    }),
  );

  it("should be created", () => {
    const interceptor: CamelcaseInterceptor = TestBed.inject(CamelcaseInterceptor);
    expect(interceptor).toBeTruthy();
  });

  it("преобразует вложенный manager overview из snake_case в domain camelCase", () => {
    const interceptor = TestBed.inject(CamelcaseInterceptor);
    const request = new HttpRequest("GET", "/programs/12/manager-overview/");
    const response = new HttpResponse({
      body: {
        participant_funnel: { unique_participants: 3 },
        evaluation_status: {
          max_evaluations_per_project: 2,
          projects: { awaiting_evaluation: 1, partially_evaluated: 1 },
        },
        activity: [{ date: "2026-08-01", submitted_solutions: 1 }],
      },
    });

    interceptor.intercept(request, { handle: () => of(response) }).subscribe(event => {
      if (!(event instanceof HttpResponse)) return;

      expect(event.body).toEqual({
        participantFunnel: { uniqueParticipants: 3 },
        evaluationStatus: {
          maxEvaluationsPerProject: 2,
          projects: { awaitingEvaluation: 1, partiallyEvaluated: 1 },
        },
        activity: [{ date: "2026-08-01", submittedSolutions: 1 }],
      });
    });
  });
});
