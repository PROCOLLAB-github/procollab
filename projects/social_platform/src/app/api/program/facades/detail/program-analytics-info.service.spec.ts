/** @format */

import { TestBed } from "@angular/core/testing";
import { ActivatedRoute, convertToParamMap, ParamMap } from "@angular/router";
import { GetProgramManagerOverviewUseCase } from "@api/program/use-cases/get-program-manager-overview.use-case";
import { ProgramAnalyticsOverview } from "@domain/program/program-analytics.model";
import { Program } from "@domain/program/program.model";
import { fail, ok } from "@domain/shared/result.type";
import { BehaviorSubject, of, Subject } from "rxjs";
import { ProgramAnalyticsInfoService } from "./program-analytics-info.service";
import { ProgramDetailMainUIInfoService } from "./ui/program-detail-main-ui-info.service";

const overview: ProgramAnalyticsOverview = {
  summary: {
    participants: { total: 2 },
    projects: { total: 7 },
    experts: { total: 1 },
    regions: { total: 1, items: [{ name: "Москва", count: 7 }] },
    participantRegions: { total: 1, items: [{ name: "Набережные Челны", count: 2 }] },
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
  attention: {
    participantsWithoutTeam: 1,
    projectsAwaitingEvaluation: 1,
    delayedExperts: { total: 0, items: [] },
  },
  activity: [],
};

describe("ProgramAnalyticsInfoService", () => {
  let service: ProgramAnalyticsInfoService;
  let getOverview: { execute: ReturnType<typeof vi.fn> };
  let programUI: ProgramDetailMainUIInfoService;
  let paramMap: BehaviorSubject<ParamMap>;

  beforeEach(() => {
    getOverview = { execute: vi.fn().mockReturnValue(of(ok(overview))) };
    paramMap = new BehaviorSubject(convertToParamMap({ programId: "12" }));

    TestBed.configureTestingModule({
      providers: [
        ProgramAnalyticsInfoService,
        ProgramDetailMainUIInfoService,
        { provide: GetProgramManagerOverviewUseCase, useValue: getOverview },
        {
          provide: ActivatedRoute,
          useValue: { parent: { paramMap: paramMap.asObservable() } },
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
    expect(service.data()?.summary.participantRegions.items).toEqual([
      { name: "Набережные Челны", count: 2 },
    ]);
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

  it("немедленно отменяет старую сводку при route change и ждёт соответствующий resolver", () => {
    const old = new Subject<ReturnType<typeof ok<ProgramAnalyticsOverview>>>();
    getOverview.execute.mockReturnValueOnce(old);
    programUI.program.set({ ...Program.default(), id: 12, isUserManager: true });
    service.initialize();
    TestBed.tick();
    expect(old.observed).toBe(true);
    expect(service.programId()).toBe(12);
    old.next(ok(overview));
    expect(service.data()).toBe(overview);

    // Like Angular Router, emit params before installing the newly resolved Program.
    paramMap.next(convertToParamMap({ programId: "13" }));

    // No effect flush or resolver change is needed to cancel the old context.
    expect(old.observed).toBe(false);
    expect(service.programId()).toBeNull();
    expect(service.data()).toBeNull();
    expect(service.pending()).toBe(true);
    expect(programUI.program()?.id).toBe(12);
    expect(getOverview.execute).toHaveBeenCalledExactlyOnceWith(12);
    TestBed.tick();
    expect(getOverview.execute).not.toHaveBeenCalledWith(13);

    programUI.program.set({ ...Program.default(), id: 13, isUserManager: true });
    TestBed.tick();
    expect(service.programId()).toBe(13);
    expect(getOverview.execute).toHaveBeenCalledTimes(2);
    expect(getOverview.execute).toHaveBeenLastCalledWith(13);
    old.next(
      ok({ ...overview, activity: [{ date: "old", registrations: 999, submittedSolutions: 999 }] }),
    );
    expect(service.data()?.activity).toEqual([]);
  });

  it.each(["invalid", "0", "-1", "12.5", "", undefined])(
    "при некорректном route ID %s сразу отменяет запрос и показывает not_found",
    programId => {
      const old = new Subject<ReturnType<typeof ok<ProgramAnalyticsOverview>>>();
      getOverview.execute.mockReturnValue(old);
      programUI.program.set({ ...Program.default(), id: 12, isUserManager: true });
      service.initialize();
      TestBed.tick();

      paramMap.next(convertToParamMap(programId === undefined ? {} : { programId }));

      expect(old.observed).toBe(false);
      expect(service.programId()).toBeNull();
      expect(service.data()).toBeNull();
      expect(service.error()?.kind).toBe("not_found");
      service.retry();
      TestBed.tick();
      expect(getOverview.execute).toHaveBeenCalledExactlyOnceWith(12);
    },
  );

  it("не использует старые manager-права для нового route и запрещает non-manager resolver", () => {
    programUI.program.set({ ...Program.default(), id: 12, isUserManager: true });
    service.initialize();
    TestBed.tick();

    paramMap.next(convertToParamMap({ programId: "13" }));
    service.retry();
    expect(service.programId()).toBeNull();
    expect(service.pending()).toBe(true);
    expect(getOverview.execute).toHaveBeenCalledExactlyOnceWith(12);

    programUI.program.set({ ...Program.default(), id: 13, isUserManager: false });
    TestBed.tick();

    expect(service.programId()).toBeNull();
    expect(service.error()?.kind).toBe("forbidden");
    expect(getOverview.execute).toHaveBeenCalledExactlyOnceWith(12);
  });

  it("ждёт исходный resolver и загружает совпавшую программу один раз", () => {
    service.initialize();
    TestBed.tick();
    expect(service.pending()).toBe(true);
    expect(service.programId()).toBeNull();
    expect(getOverview.execute).not.toHaveBeenCalled();

    programUI.program.set({ ...Program.default(), id: 12, isUserManager: true });
    TestBed.tick();

    expect(service.programId()).toBe(12);
    expect(getOverview.execute).toHaveBeenCalledExactlyOnceWith(12);
  });

  it("повторная эмиссия того же programId не отменяет и не дублирует запрос", () => {
    const response = new Subject<ReturnType<typeof ok<ProgramAnalyticsOverview>>>();
    getOverview.execute.mockReturnValue(response);
    programUI.program.set({ ...Program.default(), id: 12, isUserManager: true });
    service.initialize();
    TestBed.tick();

    paramMap.next(convertToParamMap({ programId: "12", unrelated: "changed" }));
    TestBed.tick();

    expect(response.observed).toBe(true);
    expect(service.programId()).toBe(12);
    expect(getOverview.execute).toHaveBeenCalledExactlyOnceWith(12);
  });

  it("отписывается от route params и незавершённой сводки при destroy", () => {
    const response = new Subject<ReturnType<typeof ok<ProgramAnalyticsOverview>>>();
    getOverview.execute.mockReturnValue(response);
    programUI.program.set({ ...Program.default(), id: 12, isUserManager: true });
    service.initialize();
    expect(paramMap.observed).toBe(true);
    expect(response.observed).toBe(true);

    TestBed.resetTestingModule();

    expect(paramMap.observed).toBe(false);
    expect(response.observed).toBe(false);
    paramMap.next(convertToParamMap({ programId: "13" }));
    expect(getOverview.execute).toHaveBeenCalledExactlyOnceWith(12);
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
