/** @format */
import { TestBed } from "@angular/core/testing";
import { GetProgramManagerAssignmentsUseCase } from "@api/program/use-cases/get-program-manager-assignments.use-case";
import { GetProgramManagerAssignmentScoresUseCase } from "@api/program/use-cases/get-program-manager-assignment-scores.use-case";
import { GetProgramManagerParticipantsWithoutTeamUseCase } from "@api/program/use-cases/get-program-manager-participants-without-team.use-case";
import { GetProgramManagerProjectsAwaitingEvaluationUseCase } from "@api/program/use-cases/get-program-manager-projects-awaiting-evaluation.use-case";
import { provideRouter } from "@angular/router";
import {
  ProgramAnalyticsAssignment,
  ProgramAnalyticsAssignmentScoreDetail,
  ProgramAnalyticsError,
} from "@domain/program/program-analytics.model";
import { fail, ok, Result } from "@domain/shared/result.type";
import {
  assignment,
  delayedExpert,
  scoreDetail,
} from "@domain/program/program-analytics-assignment.fixture";
import { of, Subject } from "rxjs";
import { ProgramAnalyticsDrilldownService } from "./program-analytics-drilldown.service";

describe("ProgramAnalyticsDrilldownService", () => {
  let service: ProgramAnalyticsDrilldownService;
  const assignments = { execute: vi.fn() };
  const scores = { execute: vi.fn() };
  beforeEach(() => {
    assignments.execute.mockReset().mockReturnValue(of(ok([assignment()])));
    scores.execute.mockReset().mockReturnValue(of(ok(scoreDetail())));
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: GetProgramManagerParticipantsWithoutTeamUseCase,
          useValue: { execute: vi.fn() },
        },
        {
          provide: GetProgramManagerProjectsAwaitingEvaluationUseCase,
          useValue: { execute: vi.fn() },
        },
        ProgramAnalyticsDrilldownService,
        { provide: GetProgramManagerAssignmentsUseCase, useValue: assignments },
        { provide: GetProgramManagerAssignmentScoresUseCase, useValue: scores },
      ],
    });
    service = TestBed.inject(ProgramAnalyticsDrilldownService);
  });

  it("не загружает до открытия и обновляет список при следующем открытии", () => {
    expect(assignments.execute).not.toHaveBeenCalled();
    service.openAssignments(12, "completed");
    expect(assignments.execute).toHaveBeenCalledWith(12, "completed");
    service.loadAssignmentScores(17);
    expect(service.view()).toBe("scores");
    service.back();
    expect(service.view()).toBe("assignments");
    expect(service.scoreDetail()).toBeNull();
    expect(assignments.execute).toHaveBeenCalledTimes(1);
    service.close();
    service.openAssignments(12, "completed");
    expect(assignments.execute).toHaveBeenCalledTimes(2);
  });

  it.each([0, -1, NaN, 1.5])("не делает запрос с некорректной программой %s", id => {
    service.openAssignments(id, "all");
    expect(service.open()).toBe(false);
    expect(assignments.execute).not.toHaveBeenCalled();
  });

  it("отменяет старые ответы при смене программы и закрытии", () => {
    const old = new Subject<Result<ProgramAnalyticsAssignment[], ProgramAnalyticsError>>();
    assignments.execute.mockReturnValueOnce(old);
    service.openAssignments(12, "all");
    expect(service.assignmentsPending()).toBe(true);
    service.openAssignments(13, "pending");
    expect(old.observed).toBe(false);
    old.next(ok([assignment({ assignmentId: 999 })]));
    expect(service.assignments()[0].assignmentId).toBe(17);
    service.close();
    expect(service.assignments()).toEqual([]);
    expect(service.selectedExpert()).toBeNull();
  });

  it("отменяет score request при Back и destroy", () => {
    const response = new Subject<
      Result<ProgramAnalyticsAssignmentScoreDetail, ProgramAnalyticsError>
    >();
    scores.execute.mockReturnValue(response);
    service.openAssignments(12, "completed");
    service.loadAssignmentScores(17);
    expect(service.scoreDetailPending()).toBe(true);
    service.back();
    expect(response.observed).toBe(false);
    response.next(ok(scoreDetail()));
    expect(service.scoreDetail()).toBeNull();
    service.loadAssignmentScores(17);
    TestBed.resetTestingModule();
    expect(response.observed).toBe(false);
  });

  it("не позволяет запросить detail произвольного/несданного назначения", () => {
    assignments.execute.mockReturnValue(of(ok([assignment({ status: "not_ready" })])));
    service.openAssignments(12, "all");
    service.loadAssignmentScores(99);
    service.loadAssignmentScores(17);
    expect(scores.execute).not.toHaveBeenCalled();
  });

  it("сохраняет backend order/severity; backlog строго expertId, not_ready отдельно", () => {
    const expert = delayedExpert();
    assignments.execute.mockReturnValue(
      of(
        ok([
          assignment({ assignmentId: 1, status: "pending" }),
          assignment({ assignmentId: 2, status: "not_ready" }),
          assignment({ assignmentId: 3, status: "pending", expert: { ...expert, expertId: 999 } }),
        ]),
      ),
    );
    service.openDelayed(12, { total: 1, items: [expert] });
    expect(service.delayedExperts()).toEqual([expert]);
    expect(assignments.execute).toHaveBeenCalledWith(12, "pending");
    service.showBacklog(expert);
    expect(service.waitingBacklog().map(item => item.assignmentId)).toEqual([1]);
    expect(service.notReadyBacklog().map(item => item.assignmentId)).toEqual([2]);
    service.back();
    expect(service.view()).toBe("delayed");
    expect(assignments.execute).toHaveBeenCalledTimes(1);
  });

  it("ошибки retry не закрывают delayed list/detail", () => {
    assignments.execute.mockReturnValueOnce(of(fail({ kind: "network" })));
    service.openDelayed(12, { total: 1, items: [delayedExpert()] });
    expect(service.delayedExperts()).toHaveLength(1);
    expect(service.assignmentsError()?.kind).toBe("network");
    expect(service.open()).toBe(true);
    service.loadAssignments();
    expect(service.assignmentsError()).toBeNull();
    scores.execute.mockReturnValueOnce(of(fail({ kind: "forbidden" })));
    service.loadAssignmentScores(17);
    expect(service.scoreDetailError()?.kind).toBe("forbidden");
    service.retryScores();
    expect(service.scoreDetail()).toEqual(scoreDetail());
  });
});
