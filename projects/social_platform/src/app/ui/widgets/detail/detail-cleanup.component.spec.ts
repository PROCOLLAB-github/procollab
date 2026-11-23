/** @format */

import { computed, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FormGroup } from "@angular/forms";
import { provideRouter, Router, RouterLink } from "@angular/router";
import { By } from "@angular/platform-browser";
import { of } from "rxjs";
import { ProjectFormService } from "@api/project/project-form.service";
import { ProjectAdditionalService } from "@api/project/facades/edit/project-additional.service";
import { ChatStateService } from "@domain/shared/chat-state.service";
import { Program } from "@domain/program/program.model";
import { ProgramDetailMainUIInfoService } from "@api/program/facades/detail/ui/program-detail-main-ui-info.service";
import { GetSolutionContextUseCase } from "@api/solution/use-cases/solution.use-cases";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { PublicProgramSolutionsComponent } from "@ui/pages/program/published-solutions/public-program-solutions.component";
import { DeatilComponent } from "./detail.component";
import { DetailInfoService } from "./services/detail-info.service";
import { DetailProgramInfoService } from "./services/program/detail-program-info.service";
import { DetailProjectInfoService } from "./services/project/detail-project-info.service";
import { DetailProfileInfoService } from "./services/profile/detail-profile-info.service";

describe("Detail cleanup actions", () => {
  const info = signal<any>(Program.default());
  const type = signal("program");
  const submitted = computed(() => info().currentApplication?.submitted === true);
  const copyLink = vi.fn();
  const profile = signal<any>({ id: 7 });
  const manager = signal(false),
    expert = signal(false),
    member = signal(true);

  beforeEach(async () => {
    type.set("program");
    manager.set(false);
    expert.set(false);
    member.set(true);
    info.set({ ...Program.default(), isUserMember: true });
    copyLink.mockClear();
    profile.set({ id: 7 });
    // Unused modal flags stay closed; the real template/button primitives are rendered.
    const closed = new Proxy(
      {},
      {
        get: () => signal(false),
      },
    );
    await TestBed.configureTestingModule({
      imports: [DeatilComponent, PublicProgramSolutionsComponent],
      providers: [
        provideRouter([]),
        {
          provide: ProgramDetailMainUIInfoService,
          useValue: { program: info },
        },
        { provide: GetSolutionContextUseCase, useValue: { execute: vi.fn() } },
        { provide: LoggerService, useValue: { debug: vi.fn() } },
        { provide: ProjectFormService, useValue: { getForm: () => new FormGroup({}) } },
        { provide: ChatStateService, useValue: { userOnlineStatusCache: of({}) } },
      ],
    })
      .overrideComponent(DeatilComponent, {
        set: {
          providers: [
            {
              provide: DetailInfoService,
              useValue: {
                info,
                listType: type,
                userType: signal(1),
                isUserMember: member,
                isUserManager: manager,
                isUserExpert: expert,
                isInProject: signal(true),
                isProjectAssigned: submitted,
                isContactsModalOpen: signal(false),
                isMaterialsModalOpen: signal(false),
                initializationDetail: vi.fn(),
                destroy: vi.fn(),
              },
            },
            DetailProgramInfoService,
            { provide: DetailProjectInfoService, useValue: closed },
            {
              provide: DetailProfileInfoService,
              useValue: new Proxy(
                { profile, onCopyLink: copyLink },
                {
                  get: (target, key) => Reflect.get(target, key) ?? signal(false),
                },
              ),
            },
            { provide: ProjectAdditionalService, useValue: {} },
          ],
        },
      })
      .compileComponents();
  });

  it("keeps a submitted project out of the program header", () => {
    info.update(program => ({
      ...program,
      id: 12,
      datetimeProjectSubmissionEnds: "2000-01-01T00:00:00Z",
      currentApplication: { projectId: 10, programLinkId: 44, submitted: true },
    }));
    const fixture = TestBed.createComponent(DeatilComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".info__program-action")).toBeNull();
  });

  it("does not offer a new application to a member of a team that already submitted", () => {
    info.update(program => ({
      ...program,
      currentApplication: null,
      hasSubmittedTeamProject: true,
    }));
    const fixture = TestBed.createComponent(DeatilComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".info__program-action")).toBeNull();
  });
  it.each(["", "https://example.test/cover.png"])(
    "shows exactly one program heading on desktop and mobile with cover %s",
    coverImageAddress => {
      info.set({ ...Program.default(), name: "Название программы", coverImageAddress });
      const fixture = TestBed.createComponent(DeatilComponent);
      fixture.detectChanges();
      for (const width of [1440, 390]) {
        Object.assign(fixture.componentInstance, { appWidth: width });
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();
        const headings = fixture.nativeElement.querySelectorAll("h1");
        expect(headings).toHaveLength(1);
        expect(headings[0].textContent).toContain("Название программы");
      }
    },
  );
  it.each(["", "https://example.test/cover.png"])(
    "keeps one desktop heading in the public solutions page with cover %s",
    coverImageAddress => {
      const previousWidth = window.innerWidth;
      Object.defineProperty(window, "innerWidth", { configurable: true, value: 1440 });
      try {
        info.set({ ...Program.default(), name: "Публичная программа", coverImageAddress });
        const fixture = TestBed.createComponent(PublicProgramSolutionsComponent);
        fixture.detectChanges();
        const headings = fixture.nativeElement.querySelectorAll("h1");
        expect(headings).toHaveLength(1);
        expect(headings[0].textContent).toContain("Публичная программа");
      } finally {
        Object.defineProperty(window, "innerWidth", { configurable: true, value: previousWidth });
      }
    },
  );
  it("organizer has management without a duplicate public-solutions action", () => {
    manager.set(true);
    info.set({ ...Program.default(), solutionStorageMode: "solution" });
    const fixture = TestBed.createComponent(DeatilComponent);
    fixture.detectChanges();
    const actions = fixture.nativeElement.querySelector(".info__actions");
    expect(actions.textContent).toContain("Управление программой");
    expect(actions.querySelector('a[href*="published-solutions"]')).toBeNull();
  });
  it("opens the overview for a published program and launch preparation for a draft", () => {
    manager.set(true);
    info.set({ ...Program.default(), id: 12, draft: false });
    const fixture = TestBed.createComponent(DeatilComponent);
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    const managementLink = () =>
      [...page.querySelectorAll<HTMLAnchorElement>(".info__actions a")].find(a =>
        a.textContent?.includes("Управление программой"),
      );
    expect(managementLink()?.getAttribute("href")).toBe("/office/program/12/management/analytics");
    info.set({ ...Program.default(), id: 12, draft: true });
    fixture.detectChanges();
    expect(managementLink()?.getAttribute("href")).toBe("/office/program/12/launch");
  });
  it.each([320, 1440])(
    "keeps the expert invitation outside the two organizer actions at %ipx",
    width => {
      manager.set(true);
      expert.set(true);
      info.set({ ...Program.default(), id: 12, pendingExpertInvitationId: 34 });
      const fixture = TestBed.createComponent(DeatilComponent);
      Object.assign(fixture.componentInstance, { appWidth: width });
      fixture.detectChanges();
      const page: HTMLElement = fixture.nativeElement;
      const actions = page.querySelectorAll(".info__program-action");
      expect([...actions].map(action => action.textContent?.trim())).toEqual([
        "Оценка проектов",
        "Управление программой",
      ]);
      expect(page.querySelector(".info__program-invitation-link")?.getAttribute("href")).toBe(
        "/office/evaluation?invitation=34",
      );
      expect(page.querySelector(".info__actions .info__program-invitation-link")).toBeNull();
    },
  );

  it.each([320, 1440])("only enables Подробнее for a configured landing page at %ipx", width => {
    member.set(false);
    info.set({
      ...Program.default(),
      registrationLink: "https://example.org/register",
      presentationAddress: "https://example.org/program.pdf",
      courses: [{ id: 10, title: "Курс", isAvailable: true }],
    });
    const fixture = TestBed.createComponent(DeatilComponent);
    Object.assign(fixture.componentInstance, { appWidth: width });
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    expect(page.querySelector(".info__actions button")?.disabled).toBe(true);
    expect(page.querySelector(".info__actions button")?.textContent).toContain("Подробнее");
    expect(
      [...page.querySelectorAll(".info__program-action")].map(action => action.textContent?.trim()),
    ).toEqual(["Зарегистрироваться", "Подробнее"]);
    expect(page.querySelector('a[href="https://example.org/register"]')?.textContent).toContain(
      "Зарегистрироваться",
    );

    info.update(program => ({ ...program, landingUrl: "https://example.org/event" }));
    fixture.detectChanges();
    expect(page.querySelector('a[href="https://example.org/event"]')?.textContent).toContain(
      "Подробнее",
    );
    expect(page.querySelector(".info__actions button")).toBeNull();
  });

  it.each([
    { datetimeRegistrationEnds: "2000-01-01T00:00:00Z" },
    { datetimeProjectSubmissionEnds: "2000-01-01T00:00:00Z" },
    { registrationLink: null },
  ])("keeps registration disabled and the program website accessible for %j", unavailable => {
    member.set(false);
    info.set({
      ...Program.default(),
      registrationLink: "https://example.org/register",
      landingUrl: "https://example.org/event",
      ...unavailable,
    });
    const fixture = TestBed.createComponent(DeatilComponent);
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    const registration = page.querySelector<HTMLButtonElement>("button.info__program-action");
    expect(registration?.textContent?.trim()).toBe("Зарегистрироваться");
    expect(registration?.disabled).toBe(true);
    expect(page.querySelector('a[href="https://example.org/register"]')).toBeNull();
    expect(page.querySelector('a[href="https://example.org/event"]')?.textContent).toContain(
      "Подробнее",
    );
  });
  it.each([7, 8])("shares the viewed profile using the existing copy-link flow (id=%s)", id => {
    type.set("profile");
    info.set({ id, firstName: "Имя", lastName: "Фамилия", skills: [] });
    const fixture = TestBed.createComponent(DeatilComponent);
    fixture.detectChanges();
    const actions = fixture.nativeElement.querySelector(".info__actions") as HTMLElement;
    const buttons = [...actions.querySelectorAll<HTMLButtonElement>("button")];
    const share = buttons.find(button => button.textContent?.includes("поделиться профилем"))!;
    expect(share).toBeDefined();
    expect(share.disabled).toBe(false);
    expect(actions.textContent).not.toContain("продвигать");
    if (id === 7) {
      expect(buttons[0]).toBe(share);
      const myProjects = buttons.find(button => button.textContent?.includes("мои проекты"))!;
      const navigate = vi.spyOn(TestBed.inject(Router), "navigateByUrl").mockResolvedValue(true);
      expect(myProjects.disabled).toBe(false);
      myProjects.click();
      expect(navigate).toHaveBeenCalledExactlyOnceWith("/office/projects/my");
    } else {
      expect(buttons[0].textContent).toContain("подтвердить навыки");
      expect(actions.textContent).not.toContain("мои проекты");
    }
    share.click();
    expect(copyLink).toHaveBeenCalledExactlyOnceWith(id);
  });

  it("does not wait for the current profile before offering application creation", () => {
    profile.set(null);
    const fixture = TestBed.createComponent(DeatilComponent);
    fixture.detectChanges();
    const applicationService = fixture.debugElement.injector.get(DetailProgramInfoService);
    const create = vi.spyOn(applicationService, "addNewProject").mockImplementation(() => {});
    const button = fixture.nativeElement.querySelector(
      "button.info__program-action",
    ) as HTMLButtonElement;
    expect(button.disabled).toBe(false);
    button.click();
    expect(create).toHaveBeenCalledExactlyOnceWith(1);
  });

  it("workspace/chat are genuinely disabled, focusable tooltip wrappers have no navigation", () => {
    type.set("project");
    info.set({ id: 55, name: "Проект", collaborators: [], partnerProgram: null });
    const fixture = TestBed.createComponent(DeatilComponent);
    fixture.detectChanges();
    const wrappers = fixture.debugElement.queryAll(By.css(".info__unavailable"));
    expect(wrappers).toHaveLength(2);
    for (const wrapper of wrappers) {
      const native = wrapper.nativeElement as HTMLElement;
      expect((native.querySelector("button") as HTMLButtonElement).disabled).toBe(true);
      expect(native.tabIndex).toBe(0);
      expect(native.querySelector('[role="tooltip"]')?.textContent).toBe("Появится позже");
      expect(native.getAttribute("aria-describedby")).toBe(
        native.querySelector('[role="tooltip"]')?.id,
      );
      expect(wrapper.query(By.directive(RouterLink))).toBeNull();
    }
  });
});
