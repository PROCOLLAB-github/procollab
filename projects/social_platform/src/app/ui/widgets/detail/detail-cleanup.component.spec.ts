/** @format */

import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FormGroup } from "@angular/forms";
import { provideRouter, RouterLink } from "@angular/router";
import { By } from "@angular/platform-browser";
import { of } from "rxjs";
import { ProjectFormService } from "@api/project/project-form.service";
import { ProjectAdditionalService } from "@api/project/facades/edit/project-additional.service";
import { ChatStateService } from "@domain/shared/chat-state.service";
import { Program } from "@domain/program/program.model";
import { DeatilComponent } from "./detail.component";
import { DetailInfoService } from "./services/detail-info.service";
import { DetailProgramInfoService } from "./services/program/detail-program-info.service";
import { DetailProjectInfoService } from "./services/project/detail-project-info.service";
import { DetailProfileInfoService } from "./services/profile/detail-profile-info.service";

describe("Detail cleanup actions", () => {
  const info = signal<any>(Program.default());
  const type = signal("program");
  const submitted = signal(false);
  const pending = signal(false);
  const label = signal("создать заявку");
  const copyLink = vi.fn();
  const create = vi.fn();
  const profile = signal<any>({ id: 7 });

  beforeEach(async () => {
    type.set("program");
    info.set(Program.default());
    submitted.set(false);
    pending.set(false);
    label.set("создать заявку");
    copyLink.mockClear();
    profile.set({ id: 7 });
    create.mockClear();
    // Unused modal flags stay closed; the real template/button primitives are rendered.
    const closed = new Proxy(
      {},
      {
        get: (_target, key) => (key === "submissionProjectDateExpired" ? undefined : signal(false)),
      },
    );
    await TestBed.configureTestingModule({
      imports: [DeatilComponent],
      providers: [
        provideRouter([]),
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
                isUserMember: signal(true),
                isUserManager: signal(false),
                isUserExpert: signal(false),
                isInProject: signal(true),
                isProjectAssigned: submitted,
                isContactsModalOpen: signal(false),
                isMaterialsModalOpen: signal(false),
                initializationDetail: vi.fn(),
                destroy: vi.fn(),
              },
            },
            {
              provide: DetailProgramInfoService,
              useValue: {
                isProjectsPage: signal(false),
                isMembersPage: signal(false),
                isProjectsRatingPage: signal(false),
                isAnalyticsPage: signal(false),
                isAssignProjectToProgramModalOpen: signal(false),
                isProgramEndedModalOpen: signal(false),
                isProgramSubmissionProjectsEndedModalOpen: signal(false),
                applicationLabel: label,
                applicationPending: pending,
                addNewProject: create,
              },
            },
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

  it("renders create, open-existing and submitted CTA states without changing submitted disabling", () => {
    const fixture = TestBed.createComponent(DeatilComponent);
    fixture.detectChanges();
    const button = () =>
      fixture.nativeElement.querySelector(".bar__add-project") as HTMLButtonElement;
    expect(button().textContent).toContain("создать заявку");
    // The unrelated deadline flag is absent for programs.
    expect(button().disabled).toBe(false);
    button().click();
    expect(create).toHaveBeenCalledTimes(1);
    label.set("перейти в заявку");
    fixture.detectChanges();
    expect(button().textContent).toContain("перейти в заявку");
    expect(button().disabled).toBe(false);
    pending.set(true);
    fixture.detectChanges();
    expect(button().disabled).toBe(true);
    pending.set(false);
    submitted.set(true);
    label.set("вы подали проект");
    fixture.detectChanges();
    expect(button().disabled).toBe(true);
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
      expect(buttons[1].textContent).toContain("мои проекты");
      expect(buttons[1].disabled).toBe(true);
    } else {
      expect(buttons[0].textContent).toContain("подтвердить навыки");
    }
    share.click();
    expect(copyLink).toHaveBeenCalledExactlyOnceWith(id);
  });

  it("keeps profile and project titles in the header without moving profile actions", () => {
    type.set("profile");
    info.set({
      id: 7,
      firstName: "Очень длинное составное имя пользователя",
      lastName: "Очень длинная составная фамилия пользователя",
      skills: [],
    });
    const profileFixture = TestBed.createComponent(DeatilComponent);
    profileFixture.detectChanges();

    const profileTitle = profileFixture.nativeElement.querySelector(
      ".info__avatar .info__title--project",
    ) as HTMLElement;
    expect(profileTitle.textContent).toContain("Очень длинное составное имя пользователя");
    expect(profileFixture.nativeElement.querySelector(".info__profile-heading")).toBeNull();
    expect(
      profileFixture.nativeElement.querySelector(".info__body > .info__actions"),
    ).not.toBeNull();

    type.set("project");
    info.set({ id: 55, name: "Проект", collaborators: [], partnerProgram: null });
    profileFixture.detectChanges();
    expect(profileFixture.nativeElement.querySelector(".info__profile-heading")).toBeNull();
    expect(
      profileFixture.nativeElement.querySelector(".info__avatar .info__title--project"),
    ).not.toBeNull();
  });

  it("does not wait for the current profile before offering application creation", () => {
    profile.set(null);
    const fixture = TestBed.createComponent(DeatilComponent);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector(".bar__add-project") as HTMLButtonElement;
    expect(button.disabled).toBe(false);
    button.click();
    expect(create).toHaveBeenCalledTimes(1);
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
