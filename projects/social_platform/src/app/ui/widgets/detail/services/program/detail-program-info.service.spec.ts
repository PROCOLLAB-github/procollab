/** @format */

import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FormGroup } from "@angular/forms";
import { Router } from "@angular/router";
import { ProgramDetailMainUIInfoService } from "@api/program/facades/detail/ui/program-detail-main-ui-info.service";
import { ApplyProjectToProgramUseCase } from "@api/program/use-cases/apply-project-to-program.use-case";
import { GetProgramProjectAdditionalFieldsUseCase } from "@api/program/use-cases/get-program-project-additional-fields.use-case";
import { ProjectFormService } from "@api/project/project-form.service";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { Program } from "@domain/program/program.model";
import { DetailProgramInfoService } from "./detail-program-info.service";
import { of, Subject } from "rxjs";
import { fail, ok } from "@domain/shared/result.type";
import { GetMyProjectsUseCase } from "@api/project/use-cases/get-my-projects.use-case";
import { GetProjectUseCase } from "@api/project/use-cases/get-project.use-case";
import { PartnerProgramInfo, Project } from "@domain/project/project.model";
import { programLinkFields } from "@domain/project/program-link-fields.fixture";

describe("DetailProgramInfoService", () => {
  let service: DetailProgramInfoService;
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
        {
          provide: ProgramDetailMainUIInfoService,
          useValue: { registerDateExpired: signal(false) },
        },
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

  const applicationProject = (submitted = false): Project =>
    Object.assign(Project.default(), {
      id: 55,
      leader: 7,
      draft: !submitted,
      partnerProgram: {
        id: 12,
        programId: 12,
        programLinkId: 700,
        isSubmitted: submitted,
      } as PartnerProgramInfo,
    });

  it("no application offers create; successful create immediately becomes navigation and never creates twice", () => {
    vi.mocked(TestBed.inject(GetMyProjectsUseCase).execute).mockReturnValue(
      of(ok({ count: 0, results: [] })),
    );
    service.loadApplication(12, 7);
    expect(service.applicationLabel()).toBe("Создать заявку");
    expect(service.applicationPending()).toBe(false);
    vi.mocked(TestBed.inject(GetProgramProjectAdditionalFieldsUseCase).execute).mockReturnValue(
      of(ok({ programFields: [] })) as never,
    );
    const response = new Subject<any>();
    const create = vi
      .mocked(TestBed.inject(ApplyProjectToProgramUseCase).execute)
      .mockReturnValue(response);
    service.addNewProject(12);
    service.addNewProject(12);
    expect(create).toHaveBeenCalledTimes(1);
    expect(service.applicationPending()).toBe(true);
    response.next(ok({ projectId: 55, programLinkId: 700 }));
    response.complete();
    expect(service.applicationLabel()).toBe("Перейти в заявку");
    service.addNewProject(12);
    expect(create).toHaveBeenCalledTimes(1);
    expect(router.navigate).toHaveBeenCalledTimes(2);
    expect(router.navigate).toHaveBeenLastCalledWith(["/office/projects/55/edit"], {
      queryParams: { editingStep: "additional", fromProgram: true, programLinkId: 700 },
    });
  });

  it.each([false, true])("reload uses backend draft/submitted data, submitted=%s", submitted => {
    vi.mocked(TestBed.inject(GetMyProjectsUseCase).execute).mockReturnValue(
      of(ok({ count: 1, results: [applicationProject(submitted)] })),
    );
    vi.mocked(TestBed.inject(GetProjectUseCase).execute).mockReturnValue(
      of(ok(applicationProject(submitted))),
    );
    service.loadApplication(12, 7);
    expect(service.applicationLabel()).toBe(submitted ? "вы подали проект" : "Перейти в заявку");
    expect(service.application()?.submitted).toBe(submitted);
    service.addNewProject(12);
    expect(TestBed.inject(ApplyProjectToProgramUseCase).execute).not.toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledTimes(submitted ? 0 : 1);
  });

  it("searches subsequent self pages and ignores another user's or program's project", () => {
    const getMy = vi.mocked(TestBed.inject(GetMyProjectsUseCase).execute);
    getMy
      .mockReturnValueOnce(
        of(
          ok({
            count: 3,
            results: [
              { ...applicationProject(), leader: 8 },
              { ...applicationProject(), partnerProgram: { id: 13 } as PartnerProgramInfo },
            ],
          }),
        ),
      )
      .mockReturnValueOnce(of(ok({ count: 3, results: [applicationProject()] })));
    vi.mocked(TestBed.inject(GetProjectUseCase).execute).mockReturnValue(
      of(ok(applicationProject())),
    );
    service.loadApplication(12, 7);
    expect(getMy).toHaveBeenCalledTimes(2);
    expect(getMy.mock.calls[1][0]?.get("offset")).toBe("2");
    expect(service.application()?.projectId).toBe(55);
  });

  it("a failed lookup offers retry, not unsafe creation", () => {
    const getMy = vi.mocked(TestBed.inject(GetMyProjectsUseCase).execute);
    getMy
      .mockReturnValueOnce(of(fail({ kind: "unknown" })))
      .mockReturnValueOnce(of(ok({ count: 0, results: [] })));
    service.loadApplication(12, 7);
    expect(service.applicationLabel()).toBe("Повторить проверку заявки");
    service.addNewProject(12);
    expect(getMy).toHaveBeenCalledTimes(2);
    expect(TestBed.inject(ApplyProjectToProgramUseCase).execute).not.toHaveBeenCalled();
    expect(service.applicationLabel()).toBe("Создать заявку");
  });

  it("changing program cancels old lookup and clears application state", () => {
    const old = new Subject<any>();
    const getMy = vi.mocked(TestBed.inject(GetMyProjectsUseCase).execute);
    getMy.mockReturnValueOnce(old).mockReturnValueOnce(of(ok({ count: 0, results: [] })));
    service.loadApplication(12, 7);
    service.loadApplication(13, 7);
    expect(old.observed).toBe(false);
    old.next(ok({ count: 1, results: [applicationProject()] }));
    expect(service.application()).toBeNull();
    expect(TestBed.inject(GetProjectUseCase).execute).not.toHaveBeenCalled();
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
