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

describe("DetailProgramInfoService", () => {
  let service: DetailProgramInfoService;
  let router: { navigate: ReturnType<typeof vi.fn>; navigateByUrl: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.spyOn(window, "open").mockReturnValue(null);

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
        {
          provide: GetProgramProjectAdditionalFieldsUseCase,
          useValue: { execute: vi.fn() },
        },
      ],
    });

    service = TestBed.inject(DetailProgramInfoService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function program(overrides: Partial<Program> = {}): Program {
    return Object.assign(Program.default(), overrides);
  }

  function clickEvent(): Event {
    return {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as Event;
  }

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

  it("открывает регистрацию в новой вкладке без PROCOLLAB в history", () => {
    const event = clickEvent();
    const future = new Date(Date.now() + 60_000).toISOString();
    const replace = vi.fn();
    const newTab = { opener: window, location: { replace } } as unknown as Window;
    vi.mocked(window.open).mockReturnValue(newTab);
    const registrationLink = "https://example.test/register";

    service.checkPrograRegistrationEnded(
      event,
      program({
        registrationLink,
        datetimeRegistrationEnds: future,
        datetimeProjectSubmissionEnds: future,
      }),
    );

    expect(window.open).toHaveBeenCalledWith("about:blank", "_blank");
    expect(event.preventDefault).toHaveBeenCalledOnce();
    expect(event.stopPropagation).not.toHaveBeenCalled();
    expect(newTab.opener).toBeNull();
    expect(replace).toHaveBeenCalledOnce();
    expect(replace).toHaveBeenCalledWith(registrationLink);
    expect(router.navigateByUrl).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it("сохраняет нативный переход ссылки, если popup заблокирован", () => {
    const event = clickEvent();
    const registrationLink = "https://example.test/register";

    service.checkPrograRegistrationEnded(event, program({ registrationLink }));

    expect(window.open).toHaveBeenCalledWith("about:blank", "_blank");
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(event.stopPropagation).not.toHaveBeenCalled();
  });

  it("открывает регистрацию MIR с заменой первоначальной записи history", () => {
    const event = clickEvent();
    const replace = vi.fn();
    const newTab = { opener: window, location: { replace } } as unknown as Window;
    vi.mocked(window.open).mockReturnValue(newTab);

    service.checkPrograRegistrationEnded(
      event,
      program({ name: "Кейс-чемпионат MIR", registrationLink: null }),
    );

    expect(event.preventDefault).toHaveBeenCalledOnce();
    expect(newTab.opener).toBeNull();
    expect(replace).toHaveBeenCalledWith("https://case-champ.ru/corporate#rec1176757836");
  });

  it("блокирует внешнюю ссылку и показывает модалку после окончания регистрации", () => {
    const event = clickEvent();
    const past = new Date(Date.now() - 60_000).toISOString();

    service.checkPrograRegistrationEnded(event, program({ datetimeRegistrationEnds: past }));

    expect(window.open).not.toHaveBeenCalled();
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

    expect(window.open).not.toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalledOnce();
    expect(event.stopPropagation).toHaveBeenCalledOnce();
    expect(service.isProgramSubmissionProjectsEndedModalOpen()).toBe(true);
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });
});
