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

  it("converts the program-scoped current application contract to camelCase", () => {
    const interceptor = TestBed.inject(CamelcaseInterceptor);
    const body = {
      current_project_application: {
        project_id: 123,
        program_link_id: 700,
        submitted: false,
      },
    };

    interceptor
      .intercept(new HttpRequest("GET", "/programs/12/"), {
        handle: () => of(new HttpResponse({ body })),
      })
      .subscribe(event => {
        if (!(event instanceof HttpResponse)) return;
        expect(event.body).toEqual({
          currentProjectApplication: {
            projectId: 123,
            programLinkId: 700,
            submitted: false,
          },
        });
      });
  });

  it("преобразует Notification DTO и вложенного actor в camelCase", () => {
    const interceptor = TestBed.inject(CamelcaseInterceptor);
    const body = {
      unread_count: 1,
      results: [
        {
          id: 17,
          action_url: "/office/program/5",
          read_at: null,
          created_at: "2026-09-12T08:00:00Z",
          actor: {
            id: 4,
            first_name: "Анна",
            last_name: "Иванова",
            avatar: null,
          },
        },
      ],
    };

    interceptor
      .intercept(new HttpRequest("GET", "/notifications/"), {
        handle: () => of(new HttpResponse({ body })),
      })
      .subscribe(event => {
        if (!(event instanceof HttpResponse)) return;
        expect(event.body).toEqual({
          unreadCount: 1,
          results: [
            {
              id: 17,
              actionUrl: "/office/program/5",
              readAt: null,
              createdAt: "2026-09-12T08:00:00Z",
              actor: {
                id: 4,
                firstName: "Анна",
                lastName: "Иванова",
                avatar: null,
              },
            },
          ],
        });
      });
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
        new HttpRequest<Record<string, unknown>>("GET", "/programs/12/project-analytics/"),
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

  it("attention pages: вложенные snake_case поля и null проходят без потерь", () => {
    const interceptor = TestBed.inject(CamelcaseInterceptor);
    const body = {
      count: 1,
      next: null,
      previous: null,
      mode: "open",
      results: [
        {
          program_project_id: 70,
          user_id: 123,
          registered_at: null,
          submitted_at: null,
          full_name: "Анна",
          reason_label: "Ожидает первой оценки",
          assignments_total: null,
          assignments_completed: null,
          leader: { user_id: 123, full_name: "Анна", avatar: null },
        },
      ],
    };
    interceptor
      .intercept(
        new HttpRequest("GET", "/programs/12/project-analytics/projects-awaiting-evaluation/"),
        { handle: () => of(new HttpResponse({ body })) },
      )
      .subscribe(event => {
        if (!(event instanceof HttpResponse)) return;
        expect(event.body).toEqual({
          count: 1,
          next: null,
          previous: null,
          mode: "open",
          results: [
            {
              programProjectId: 70,
              userId: 123,
              registeredAt: null,
              submittedAt: null,
              fullName: "Анна",
              reasonLabel: "Ожидает первой оценки",
              assignmentsTotal: null,
              assignmentsCompleted: null,
              leader: { userId: 123, fullName: "Анна", avatar: null },
            },
          ],
        });
      });
  });

  it("not-submitted: overview, nullable metadata и вложенные поля преобразуются автоматически", () => {
    const interceptor = TestBed.inject(CamelcaseInterceptor);
    const body = {
      attention: { projects_not_submitted: { applicable: true, total: 1 } },
      count: 1,
      next: null,
      previous: null,
      applicable: true,
      submission_deadline: null,
      submission_open: true,
      results: [
        {
          program_project_id: 70,
          project: { id: 55, name: "Проект" },
          leader: { user_id: 123, full_name: "Анна", avatar: null },
          linked_at: "2026-09-01T10:00:00Z",
        },
      ],
    };
    interceptor
      .intercept(new HttpRequest("GET", "/programs/12/project-analytics/projects-not-submitted/"), {
        handle: () => of(new HttpResponse({ body })),
      })
      .subscribe(event => {
        if (!(event instanceof HttpResponse)) return;
        expect(event.body).toEqual({
          attention: { projectsNotSubmitted: { applicable: true, total: 1 } },
          count: 1,
          next: null,
          previous: null,
          applicable: true,
          submissionDeadline: null,
          submissionOpen: true,
          results: [
            {
              programProjectId: 70,
              project: { id: 55, name: "Проект" },
              leader: { userId: 123, fullName: "Анна", avatar: null },
              linkedAt: "2026-09-01T10:00:00Z",
            },
          ],
        });
      });
  });

  it("преобразует вложенный manager overview из snake_case в domain camelCase", () => {
    const interceptor = TestBed.inject(CamelcaseInterceptor);
    const request = new HttpRequest("GET", "/programs/12/project-analytics/");
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
        cases: {
          configured: true,
          submission_applicable: true,
          items: [
            {
              name: "Case A",
              participants_total: 7,
              projects_total: 3,
              not_submitted: 1,
              submitted: 2,
            },
            {
              name: "Case B",
              participants_total: 4,
              projects_total: 1,
              not_submitted: 0,
              submitted: 1,
            },
            {
              name: "Case C",
              participants_total: 0,
              projects_total: 0,
              not_submitted: 0,
              submitted: 0,
            },
          ],
          without_case: {
            participants_total: 3,
            projects_total: 2,
            not_submitted: 2,
            submitted: 0,
          },
        },
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
        cases: {
          configured: true,
          submissionApplicable: true,
          items: [
            {
              name: "Case A",
              participantsTotal: 7,
              projectsTotal: 3,
              notSubmitted: 1,
              submitted: 2,
            },
            {
              name: "Case B",
              participantsTotal: 4,
              projectsTotal: 1,
              notSubmitted: 0,
              submitted: 1,
            },
            {
              name: "Case C",
              participantsTotal: 0,
              projectsTotal: 0,
              notSubmitted: 0,
              submitted: 0,
            },
          ],
          withoutCase: { participantsTotal: 3, projectsTotal: 2, notSubmitted: 2, submitted: 0 },
        },
      });
    });
  });
});
