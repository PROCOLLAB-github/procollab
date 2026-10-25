/** @format */

import { TestBed } from "@angular/core/testing";
import { FormGroup } from "@angular/forms";
import { Router } from "@angular/router";
import { ProgramDetailMainUIInfoService } from "@api/program/facades/detail/ui/program-detail-main-ui-info.service";
import { ApplyProjectToProgramUseCase } from "@api/program/use-cases/apply-project-to-program.use-case";
import { GetProgramProjectAdditionalFieldsUseCase } from "@api/program/use-cases/get-program-project-additional-fields.use-case";
import { ProjectFormService } from "@api/project/project-form.service";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { Program, ProgramCurrentApplication } from "@domain/program/program.model";
import { DetailProgramInfoService } from "./detail-program-info.service";
import { of, Subject } from "rxjs";
import { fail, ok, Result } from "@domain/shared/result.type";
import { GetMyProjectsUseCase } from "@api/project/use-cases/get-my-projects.use-case";
import { GetProjectUseCase } from "@api/project/use-cases/get-project.use-case";
import { PartnerProgramInfo, Project } from "@domain/project/project.model";
import { programLinkFields } from "@domain/project/program-link-fields.fixture";
import { ApplyToProgramResponse } from "@domain/program/results/apply-to-program";
import { GetSolutionContextUseCase } from "@api/solution/use-cases/solution.use-cases";
import { SolutionContext } from "@domain/solution/solution-contract.model";

const legacyContext: SolutionContext = {
  programId: 12,
  storageMode: "legacy_project",
  isRegistered: true,
  isCompetitive: true,
  submissionOpen: true,
  submissionDeadline: null,
  canCreate: false,
  blockedReason: "legacy_mode",
  currentApplication: null,
};

type ApplyResult = Result<
  ApplyToProgramResponse,
  { kind: "apply_project_to_program_error"; cause?: unknown }
>;

describe("DetailProgramInfoService", () => {
  let service: DetailProgramInfoService;
  let programUI: ProgramDetailMainUIInfoService;
  let router: { navigate: ReturnType<typeof vi.fn>; navigateByUrl: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    router = {
      navigate: vi.fn(() => Promise.resolve(true)),
      navigateByUrl: vi.fn(() => Promise.resolve(true)),
    };

    TestBed.configureTestingModule({
      providers: [
        DetailProgramInfoService,
        { provide: Router, useValue: router },
        { provide: LoggerService, useValue: { debug: vi.fn() } },
        { provide: ProjectFormService, useValue: { getForm: () => new FormGroup({}) } },
        ProgramDetailMainUIInfoService,
        { provide: ApplyProjectToProgramUseCase, useValue: { execute: vi.fn() } },
        {
          provide: GetSolutionContextUseCase,
          useValue: { execute: vi.fn(() => of(ok(legacyContext))) },
        },
        { provide: GetMyProjectsUseCase, useValue: { execute: vi.fn() } },
        { provide: GetProjectUseCase, useValue: { execute: vi.fn() } },
        {
          provide: GetProgramProjectAdditionalFieldsUseCase,
          useValue: { execute: vi.fn() },
        },
      ],
    });

    service = TestBed.inject(DetailProgramInfoService);
    programUI = TestBed.inject(ProgramDetailMainUIInfoService);
    programUI.program.set(program({ id: 12, isUserMember: true }));
  });

  function program(overrides: Partial<Program> = {}): Program {
    return Object.assign(Program.default(), overrides);
  }

  it("uses the explicit solution mode without creating a Project", () => {
    vi.mocked(TestBed.inject(GetSolutionContextUseCase).execute).mockReturnValue(
      of(ok({ ...legacyContext, storageMode: "solution", canCreate: true, blockedReason: null })),
    );
    service.addNewProject(12);
    expect(router.navigate).toHaveBeenCalledWith(["/office/program/12/solutions/new"]);
    expect(TestBed.inject(ApplyProjectToProgramUseCase).execute).not.toHaveBeenCalled();
    expect(TestBed.inject(GetProgramProjectAdditionalFieldsUseCase).execute).not.toHaveBeenCalled();
  });

  it("opens an existing solution with its own program ID and never creates again", () => {
    vi.mocked(TestBed.inject(GetSolutionContextUseCase).execute).mockReturnValue(
      of(
        ok({
          ...legacyContext,
          storageMode: "solution",
          currentApplication: { kind: "solution", programId: 12, solutionId: 88, name: "Решение" },
        }),
      ),
    );
    service.addNewProject(12);
    expect(router.navigate).toHaveBeenCalledWith(["/office/program/12/solutions/88"], {
      queryParams: {},
    });
    expect(TestBed.inject(ApplyProjectToProgramUseCase).execute).not.toHaveBeenCalled();
  });

  it("opens the owned solution after the deadline without trusting a stale legacy reference", () => {
    programUI.program.set(
      program({
        id: 12,
        isUserMember: true,
        solutionStorageMode: "solution",
        datetimeProjectSubmissionEnds: "2000-01-01T00:00:00Z",
        currentApplication: { projectId: 55, programLinkId: 700, submitted: true },
      }),
    );
    vi.mocked(TestBed.inject(GetSolutionContextUseCase).execute).mockReturnValue(
      of(
        ok({
          ...legacyContext,
          storageMode: "solution",
          submissionOpen: false,
          canCreate: false,
          currentApplication: { kind: "solution", programId: 12, solutionId: 88, name: "Решение" },
        }),
      ),
    );
    expect(service.applicationLabel()).toBe("мое решение");
    service.addNewProject(12);
    expect(router.navigate).toHaveBeenCalledExactlyOnceWith(["/office/program/12/solutions/88"], {
      queryParams: {},
    });
    expect(TestBed.inject(ApplyProjectToProgramUseCase).execute).not.toHaveBeenCalled();
  });

  it("does not create a solution when the closed context has no owned application", () => {
    programUI.program.set(program({ id: 12, isUserMember: true, solutionStorageMode: "solution" }));
    vi.mocked(TestBed.inject(GetSolutionContextUseCase).execute).mockReturnValue(
      of(
        ok({
          ...legacyContext,
          storageMode: "solution",
          submissionOpen: false,
          canCreate: false,
          blockedReason: "submission_closed",
        }),
      ),
    );
    service.addNewProject(12);
    expect(router.navigate).not.toHaveBeenCalled();
    expect(TestBed.inject(ApplyProjectToProgramUseCase).execute).not.toHaveBeenCalled();
    expect(service.isAssignProjectToProgramModalOpen()).toBe(true);
  });

  it("context failure does not silently fall back to legacy creation", () => {
    vi.mocked(TestBed.inject(GetSolutionContextUseCase).execute).mockReturnValue(
      of(fail({ code: "network", detail: "Нет сети", errors: [], meta: {} })),
    );
    service.addNewProject(12);
    expect(service.applicationPending()).toBe(false);
    expect(service.isAssignProjectToProgramModalOpen()).toBe(true);
    expect(service.assignProjectToProgramModalMessage()).toBe("Нет сети");
    expect(TestBed.inject(ApplyProjectToProgramUseCase).execute).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it("explains paused creation at the program entry without navigation or legacy apply", () => {
    programUI.program.set(program({ id: 12, isUserMember: true, solutionStorageMode: "solution" }));
    vi.mocked(TestBed.inject(GetSolutionContextUseCase).execute).mockReturnValue(
      of(
        ok({
          ...legacyContext,
          storageMode: "solution",
          canCreate: false,
          blockedReason: "solution_creation_disabled",
        }),
      ),
    );
    service.addNewProject(12);
    expect(service.assignProjectToProgramModalMessage()).toBe(
      "Создание новых решений временно приостановлено. Ранее созданные заявки доступны.",
    );
    expect(service.isAssignProjectToProgramModalOpen()).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
    expect(TestBed.inject(ApplyProjectToProgramUseCase).execute).not.toHaveBeenCalled();
  });

  it("ignores stale program context and guards double clicks", () => {
    const response = new Subject<Result<SolutionContext, never>>();
    const getContext = vi
      .mocked(TestBed.inject(GetSolutionContextUseCase).execute)
      .mockReturnValue(response);
    service.addNewProject(12);
    service.addNewProject(12);
    expect(getContext).toHaveBeenCalledTimes(1);
    programUI.program.set(program({ id: 99 }));
    response.next(ok({ ...legacyContext, storageMode: "solution", canCreate: true }));
    response.complete();
    expect(router.navigate).not.toHaveBeenCalled();
    expect(TestBed.inject(ApplyProjectToProgramUseCase).execute).not.toHaveBeenCalled();
  });

  it("omits only system case from apply, preserves generic defaults and navigates with exact link", () => {
    const fields = programLinkFields().fields;
    const file = { ...fields[2], id: 20, name: "attachment", fieldType: "file" as const };
    vi.mocked(TestBed.inject(GetProgramProjectAdditionalFieldsUseCase).execute).mockReturnValue(
      of(ok({ programFields: [...fields, file] })) as never,
    );
    const apply = vi.mocked(TestBed.inject(ApplyProjectToProgramUseCase).execute);
    apply.mockReturnValue(of(ok({ projectId: 55, programLinkId: 700 })));
    service.addNewProject(12);
    const body = apply.mock.calls[0][1];
    expect(body.programFieldValues).toEqual([
      { fieldId: 6, valueText: "X" },
      { fieldId: 7, valueText: "-" },
      { fieldId: 8, valueText: "false" },
    ]);
    expect(router.navigate).toHaveBeenCalledExactlyOnceWith(["/office/projects/55/edit"], {
      queryParams: { editingStep: "additional", fromProgram: true, programLinkId: 700 },
    });
  });

  function clickEvent(): Event {
    return {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as Event;
  }

  function setCurrentApplication(currentApplication: ProgramCurrentApplication | null): void {
    programUI.program.set(program({ id: 12, isUserMember: true, currentApplication }));
  }

  it("currentApplication=null offers application creation", () => {
    expect(service.applicationLabel()).toBe("создать заявку");
    expect(service.application()).toBeNull();
  });

  it("successful create sets a local draft and subsequent click opens it without a second POST", () => {
    vi.mocked(TestBed.inject(GetProgramProjectAdditionalFieldsUseCase).execute).mockReturnValue(
      of(ok({ programFields: [] })) as never,
    );
    const response = new Subject<ApplyResult>();
    const create = vi
      .mocked(TestBed.inject(ApplyProjectToProgramUseCase).execute)
      .mockReturnValue(response);
    service.addNewProject(12);
    service.addNewProject(12);
    expect(create).toHaveBeenCalledTimes(1);
    expect(service.applicationPending()).toBe(true);
    response.next(ok({ projectId: 55, programLinkId: 700 }));
    response.complete();
    expect(service.applicationPending()).toBe(false);
    expect(service.application()).toEqual({
      projectId: 55,
      programLinkId: 700,
      submitted: false,
    });
    expect(programUI.program()?.currentApplication).toEqual(service.application());
    expect(service.applicationLabel()).toBe("перейти в заявку");
    service.addNewProject(12);
    expect(create).toHaveBeenCalledTimes(1);
    expect(router.navigate).toHaveBeenCalledTimes(2);
    expect(router.navigate).toHaveBeenLastCalledWith(["/office/projects/55/edit"], {
      queryParams: { editingStep: "additional", fromProgram: true, programLinkId: 700 },
    });
  });

  it("backend draft immediately offers navigation with backend IDs and does not create", () => {
    setCurrentApplication({ projectId: 10, programLinkId: 44, submitted: false });

    expect(service.applicationLabel()).toBe("перейти в заявку");
    service.addNewProject(12);
    expect(TestBed.inject(ApplyProjectToProgramUseCase).execute).not.toHaveBeenCalled();
    expect(TestBed.inject(GetProgramProjectAdditionalFieldsUseCase).execute).not.toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledExactlyOnceWith(["/office/projects/10/edit"], {
      queryParams: { editingStep: "additional", fromProgram: true, programLinkId: 44 },
    });
  });

  it("backend submitted application keeps the existing disabled state", () => {
    setCurrentApplication({ projectId: 10, programLinkId: 44, submitted: true });

    expect(service.applicationLabel()).toBe("вы подали проект");
    service.addNewProject(12);
    expect(TestBed.inject(ApplyProjectToProgramUseCase).execute).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it("reload reads an existing application directly from Program without project requests", () => {
    setCurrentApplication({ projectId: 55, programLinkId: 700, submitted: false });

    expect(service.application()).toEqual({
      projectId: 55,
      programLinkId: 700,
      submitted: false,
    });
    expect(service.applicationLabel()).toBe("перейти в заявку");
    expect(TestBed.inject(GetMyProjectsUseCase).execute).not.toHaveBeenCalled();
    expect(TestBed.inject(GetProjectUseCase).execute).not.toHaveBeenCalled();
  });

  it("create error keeps application empty and allows retry", () => {
    vi.mocked(TestBed.inject(GetProgramProjectAdditionalFieldsUseCase).execute).mockReturnValue(
      of(ok({ programFields: [] })) as never,
    );
    const create = vi.mocked(TestBed.inject(ApplyProjectToProgramUseCase).execute);
    create
      .mockReturnValueOnce(
        of(
          fail({
            kind: "apply_project_to_program_error" as const,
            cause: { status: 500 },
          }),
        ),
      )
      .mockReturnValueOnce(of(ok({ projectId: 55, programLinkId: 700 })));

    service.addNewProject(12);
    expect(service.application()).toBeNull();
    expect(service.applicationLabel()).toBe("создать заявку");
    expect(service.applicationPending()).toBe(false);
    expect(router.navigate).not.toHaveBeenCalled();

    service.addNewProject(12);
    expect(create).toHaveBeenCalledTimes(2);
    expect(service.application()?.projectId).toBe(55);
  });

  it("multi-program state trusts Program B currentApplication instead of legacy project Program A", () => {
    const legacyProgramAProject = Object.assign(Project.default(), {
      id: 99,
      partnerProgram: {
        id: 1,
        programId: 1,
        programLinkId: 101,
        isSubmitted: false,
      } as PartnerProgramInfo,
    });
    vi.mocked(TestBed.inject(GetMyProjectsUseCase).execute).mockReturnValue(
      of(ok({ count: 1, results: [legacyProgramAProject] })),
    );
    vi.mocked(TestBed.inject(GetProjectUseCase).execute).mockReturnValue(
      of(ok(legacyProgramAProject)),
    );
    setCurrentApplication({ projectId: 100, programLinkId: 202, submitted: false });

    expect(service.applicationLabel()).toBe("перейти в заявку");
    service.addNewProject(12);
    expect(router.navigate).toHaveBeenCalledExactlyOnceWith(["/office/projects/100/edit"], {
      queryParams: { editingStep: "additional", fromProgram: true, programLinkId: 202 },
    });
    expect(TestBed.inject(GetMyProjectsUseCase).execute).not.toHaveBeenCalled();
    expect(TestBed.inject(GetProjectUseCase).execute).not.toHaveBeenCalled();
    expect(TestBed.inject(ApplyProjectToProgramUseCase).execute).not.toHaveBeenCalled();
  });

  it("возвращает внешнюю ссылку регистрации программы", () => {
    const registrationLink = "https://example.test/register";

    expect(service.getRegistrationLink(program({ registrationLink }))).toBe(registrationLink);
  });

  it("не предлагает встроенную регистрацию без внешней ссылки", () => {
    expect(service.getRegistrationLink(program({ registrationLink: null }))).toBeNull();
  });

  it("сохраняет специальную ссылку регистрации программы MIR", () => {
    const target = service.getRegistrationLink(
      program({ name: "Кейс-чемпионат MIR", registrationLink: null }),
    );

    expect(target).toBe("https://case-champ.ru/corporate#rec1176757836");
  });

  it("не запускает Angular navigation при открытых сроках регистрации", () => {
    const event = clickEvent();
    const future = new Date(Date.now() + 60_000).toISOString();

    service.checkPrograRegistrationEnded(
      event,
      program({ datetimeRegistrationEnds: future, datetimeProjectSubmissionEnds: future }),
    );

    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(event.stopPropagation).not.toHaveBeenCalled();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it("отмечает analytics как активную внутреннюю вкладку", () => {
    service.applyUpdateStage("analytics", true);

    expect(service.isAnalyticsPage()).toBe(true);

    service.applyUpdateStage("analytics", false);
    expect(service.isAnalyticsPage()).toBe(false);
  });

  it("блокирует внешнюю ссылку и показывает модалку после окончания регистрации", () => {
    const event = clickEvent();
    const past = new Date(Date.now() - 60_000).toISOString();

    service.checkPrograRegistrationEnded(event, program({ datetimeRegistrationEnds: past }));

    expect(event.preventDefault).toHaveBeenCalledOnce();
    expect(event.stopPropagation).toHaveBeenCalledOnce();
    expect(service.isProgramEndedModalOpen()).toBe(true);
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it("блокирует внешнюю ссылку после окончания подачи проектов", () => {
    const event = clickEvent();
    const future = new Date(Date.now() + 60_000).toISOString();
    const past = new Date(Date.now() - 60_000).toISOString();

    service.checkPrograRegistrationEnded(
      event,
      program({ datetimeRegistrationEnds: future, datetimeProjectSubmissionEnds: past }),
    );

    expect(event.preventDefault).toHaveBeenCalledOnce();
    expect(event.stopPropagation).toHaveBeenCalledOnce();
    expect(service.isProgramSubmissionProjectsEndedModalOpen()).toBe(true);
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });
});
