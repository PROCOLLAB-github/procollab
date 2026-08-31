/** @format */

import { TestBed } from "@angular/core/testing";
import { ActivatedRoute } from "@angular/router";
import { GetAllProjectsUseCase } from "@api/program/use-cases/get-all-projects.use-case";
import { GetProgramManagerOverviewUseCase } from "@api/program/use-cases/get-program-manager-overview.use-case";
import { ProgramAnalyticsOverview } from "@domain/program/program-analytics.model";
import { Program } from "@domain/program/program.model";
import { fail, ok } from "@domain/shared/result.type";
import { of, Subject } from "rxjs";
import { ProgramAnalyticsInfoService } from "./program-analytics-info.service";
import { ProgramDetailMainUIInfoService } from "./ui/program-detail-main-ui-info.service";

const overview = { participants: { total: 2 } } as ProgramAnalyticsOverview;

describe("ProgramAnalyticsInfoService", () => {
  let service: ProgramAnalyticsInfoService;
  let getOverview: { execute: ReturnType<typeof vi.fn> };
  let getProjects: { execute: ReturnType<typeof vi.fn> };
  let programUI: ProgramDetailMainUIInfoService;

  beforeEach(() => {
    getOverview = { execute: vi.fn().mockReturnValue(of(ok(overview))) };
    getProjects = {
      execute: vi.fn().mockReturnValue(of(ok({ count: 7, results: [], next: "", previous: "" }))),
    };

    TestBed.configureTestingModule({
      providers: [
        ProgramAnalyticsInfoService,
        ProgramDetailMainUIInfoService,
        { provide: GetProgramManagerOverviewUseCase, useValue: getOverview },
        { provide: GetAllProjectsUseCase, useValue: getProjects },
        {
          provide: ActivatedRoute,
          useValue: { parent: { snapshot: { params: { programId: "12" } } } },
        },
      ],
    });

    service = TestBed.inject(ProgramAnalyticsInfoService);
    programUI = TestBed.inject(ProgramDetailMainUIInfoService);
  });

  it("загружает manager overview и count проектов", () => {
    programUI.program.set({ ...Program.default(), id: 12, isUserManager: true });

    service.initialize();

    expect(service.data()).toEqual({ overview, projectCount: 7 });
    expect(getOverview.execute).toHaveBeenCalledExactlyOnceWith(12);
    expect(getProjects.execute).toHaveBeenCalledOnce();
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
    expect(service.data()?.overview).toBe(overview);
    expect(getOverview.execute).toHaveBeenCalledTimes(2);
  });
});
