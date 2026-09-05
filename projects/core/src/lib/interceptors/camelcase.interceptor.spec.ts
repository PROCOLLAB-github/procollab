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

  it("преобразует expert drilldown и SLA с фактическими overdue24H/overdue48H", () => {
    const interceptor = TestBed.inject(CamelcaseInterceptor);
    const body = {
      attention: {
        delayed_experts: {
          total: 1,
          items: [{ expert_id: 4, overdue_24h: 3, overdue_48h: 1, oldest_waiting_seconds: 187200 }],
        },
      },
      assignments: [
        {
          assignment_id: 17,
          criteria_total: 5,
          criteria_scored: 2,
          waiting_seconds: 108000,
          expert: { full_name: "Иван Иванов", user_id: 123 },
          scores: [{ criterion_id: 1, min_value: 0, is_scored: true }],
        },
      ],
    };
    interceptor
      .intercept(
        new HttpRequest<Record<string, unknown>>("GET", "/programs/12/manager-overview/"),
        { handle: () => of(new HttpResponse({ body })) },
      )
      .subscribe(event => {
        if (!(event instanceof HttpResponse)) return;
        expect(event.body).toEqual({
          attention: {
            delayedExperts: {
              total: 1,
              items: [{ expertId: 4, overdue24H: 3, overdue48H: 1, oldestWaitingSeconds: 187200 }],
            },
          },
          assignments: [
            {
              assignmentId: 17,
              criteriaTotal: 5,
              criteriaScored: 2,
              waitingSeconds: 108000,
              expert: { fullName: "Иван Иванов", userId: 123 },
              scores: [{ criterionId: 1, minValue: 0, isScored: true }],
            },
          ],
        });
      });
  });

  it("преобразует вложенный manager overview из snake_case в domain camelCase", () => {
    const interceptor = TestBed.inject(CamelcaseInterceptor);
    const request = new HttpRequest("GET", "/programs/12/manager-overview/");
    const response = new HttpResponse({
      body: {
        summary: {
          participant_regions: { total: 1, items: [{ name: "Набережные Челны", count: 3 }] },
        },
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
        summary: {
          participantRegions: { total: 1, items: [{ name: "Набережные Челны", count: 3 }] },
        },
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
