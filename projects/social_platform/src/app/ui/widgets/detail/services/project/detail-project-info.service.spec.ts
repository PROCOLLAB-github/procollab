/** @format */

import { HttpErrorResponse } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { ActivatedRoute, convertToParamMap, Router } from "@angular/router";
import { of } from "rxjs";
import { LeaveProjectUseCase } from "@api/project/use-cases/leave-project.use-case";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { Project } from "@domain/project/project.model";
import { SnackbarService } from "@domain/shared/snackbar.service";
import { DetailProjectInfoService } from "./detail-project-info.service";

describe("Выход из команды в выбранном контексте программы", () => {
  const project = {
    id: 5,
    teamPolicy: {
      isFrozen: false,
      requiresProgramContext: true,
      programLinkId: null,
      programLinks: [
        { id: 901, programId: 9 },
        { id: 902, programId: 10 },
      ],
    },
  } as Project;
  let route: {
    data: ReturnType<typeof of>;
    snapshot: { queryParamMap: ReturnType<typeof convertToParamMap> };
  };
  const leave = { execute: vi.fn() };
  const router = { navigateByUrl: vi.fn() };
  const snackbar = { error: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    leave.execute.mockReturnValue(of({ ok: true }));
    router.navigateByUrl.mockResolvedValue(true);
    route = {
      data: of({ data: [project] }),
      snapshot: { queryParamMap: convertToParamMap({}) },
    };
    TestBed.configureTestingModule({
      providers: [
        DetailProjectInfoService,
        { provide: ActivatedRoute, useValue: route },
        { provide: LeaveProjectUseCase, useValue: leave },
        { provide: Router, useValue: router },
        { provide: LoggerService, useValue: { debug: vi.fn() } },
        { provide: SnackbarService, useValue: snackbar },
      ],
    });
  });

  it.each([
    ["902", 902],
    ["9", undefined],
    ["999", undefined],
    [null, undefined],
  ])("передаёт только подтверждённый link ID из URL %s", (selected, expected) => {
    route.snapshot.queryParamMap = convertToParamMap(
      selected === null ? {} : { programLinkId: selected },
    );
    TestBed.inject(DetailProjectInfoService).onLeave();
    expect(leave.execute).toHaveBeenCalledExactlyOnceWith(5, expected);
  });

  it("state conflict сохраняет страницу и показывает понятную причину", () => {
    leave.execute.mockReturnValue(
      of({
        ok: false,
        error: {
          kind: "leave_project_error",
          cause: new HttpErrorResponse({
            status: 409,
            error: { code: "team_frozen", detail: "PRIVATE SERVER TEXT" },
          }),
        },
      }),
    );
    const service = TestBed.inject(DetailProjectInfoService);
    service.onLeave();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
    expect(snackbar.error).toHaveBeenCalledWith("Состав команды зафиксирован после сдачи проекта.");
    expect(service.leaderLeaveModal()).toBe(false);
  });
});
