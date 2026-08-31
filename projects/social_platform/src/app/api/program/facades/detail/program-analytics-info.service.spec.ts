/** @format */

import { TestBed } from "@angular/core/testing";
import { ActivatedRoute } from "@angular/router";
import { GetProgramManagerOverviewUseCase } from "@api/program/use-cases/get-program-manager-overview.use-case";
import { ProgramAnalyticsOverview } from "@domain/program/program-analytics.model";
import { Program } from "@domain/program/program.model";
import { fail, ok } from "@domain/shared/result.type";
import { of, Subject } from "rxjs";
import { ProgramAnalyticsInfoService } from "./program-analytics-info.service";
import { ProgramDetailMainUIInfoService } from "./ui/program-detail-main-ui-info.service";

const overview: ProgramAnalyticsOverview = {
  summary: {
    participants: { total: 2 },
    projects: { total: 7 },
    experts: { total: 1 },
    regions: { total: 1, items: [{ name: "Москва", count: 7 }] },
  },
  participantFunnel: {
    registrations: 3,
    uniqueParticipants: 2,
    withTeam: 1,
    projectCreators: 1,
    submittedProjectCreators: 1,
  },
  solutionFunnel: { created: 7, notSubmitted: 6, submitted: 1, evaluated: 0 },
  evaluationStatus: {
    mode: "open",
    maxEvaluationsPerProject: null,
    assignments: { total: 0, pending: 0, evaluated: 0 },
    projects: { submitted: 1, awaitingEvaluation: 1, partiallyEvaluated: 0, evaluated: 0 },
  },
  attention: { participantsWithoutTeam: 1, projectsAwaitingEvaluation: 1 },
  activity: [],
};

describe("ProgramAnalyticsInfoService", () => {
  let service: ProgramAnalyticsInfoService;
  let getOverview: { execute: ReturnType<typeof vi.fn> };
  let programUI: ProgramDetailMainUIInfoService;

  beforeEach(() => {
    getOverview = { execute: vi.fn().mockReturnValue(of(ok(overview))) };

    TestBed.configureTestingModule({
      providers: [
        ProgramAnalyticsInfoService,
        ProgramDetailMainUIInfoService,
        { provide: GetProgramManagerOverviewUseCase, useValue: getOverview },
        {
          provide: ActivatedRoute,
          useValue: { parent: { snapshot: { params: { programId: "12" } } } },
        },
      ],
    });

    service = TestBed.inject(ProgramAnalyticsInfoService);
    programUI = TestBed.inject(ProgramDetailMainUIInfoService);
  });

  it("загружает только authoritative manager overview", () => {
    programUI.program.set({ ...Program.default(), id: 12, isUserManager: true });

    service.initialize();

    expect(service.data()).toBe(overview);
    expect(service.data()?.summary.projects.total).toBe(7);
    expect(getOverview.execute).toHaveBeenCalledExactlyOnceWith(12);
  });

  it("не запрашивает аналитику для пользователя без manager-признака", () => {
    programUI.program.set({ ...Program.default(), id: 12, isUserManager: false });

    service.initialize();

    expect(service.error()?.kind).toBe("forbidden");
    expect(getOverview.execute).not.toHaveBeenCalled();
  });

  it("сохраняет loading до завершения manager overview", () => {
    const response$ = new Subject<ReturnType<typeof ok<ProgramAnalyticsOverview>>>();
    getOverview.execute.mockReturnValue(response$);
    programUI.program.set({ ...Program.default(), id: 12, isUserManager: true });

    service.initialize();

    expect(service.pending()).toBe(true);
    response$.next(ok(overview));
    response$.complete();
    expect(service.pending()).toBe(false);
  });

  it("отображает recoverable error и повторяет запрос", () => {
    getOverview.execute
      .mockReturnValueOnce(of(fail({ kind: "manager_overview_error", status: 500 })))
      .mockReturnValueOnce(of(ok(overview)));
    programUI.program.set({ ...Program.default(), id: 12, isUserManager: true });

    service.initialize();
    expect(service.error()?.kind).toBe("network");

    service.retry();
    expect(service.data()).toBe(overview);
    expect(getOverview.execute).toHaveBeenCalledTimes(2);
  });
});
