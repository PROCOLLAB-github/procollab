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
