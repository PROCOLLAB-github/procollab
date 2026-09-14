/** @format */

import "@angular/compiler";
import { Component, signal, provideZonelessChangeDetection, ApplicationRef } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from "@angular/platform-browser-dynamic/testing";
import { provideRouter } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { FormGroup } from "@angular/forms";
import { of } from "rxjs";
import { API_URL, PRODUCTION } from "@corelib";
import { ProfileControlPanelComponent, SidebarComponent } from "@uilib";
import { DeatilComponent } from "@ui/widgets/detail/detail.component";
import { DetailInfoService } from "@ui/widgets/detail/services/detail-info.service";
import { DetailProfileInfoService } from "@ui/widgets/detail/services/profile/detail-profile-info.service";
import { DetailProgramInfoService } from "@ui/widgets/detail/services/program/detail-program-info.service";
import { DetailProjectInfoService } from "@ui/widgets/detail/services/project/detail-project-info.service";
import { ProjectFormService } from "@api/project/project-form.service";
import { ProjectAdditionalService } from "@api/project/facades/edit/project-additional.service";
import { ChatStateService } from "@domain/shared/chat-state.service";
import { Program } from "@domain/program/program.model";
import { User } from "@domain/auth/user.model";
import { ExpandService } from "@api/expand/expand.service";
import { ProgramDetailMainComponent } from "@pages/program/detail/main/main.component";
import { ProgramDetailMainService } from "@api/program/facades/detail/program-detail-main-info.service";
import { ProgramDetailMainUIInfoService } from "@api/program/facades/detail/ui/program-detail-main-ui-info.service";
import { NewsInfoService } from "@api/news/news-info.service";

import { ProgramRoleWidgetComponent } from "@pages/program/detail/main/role-widget/program-role-widget.component";
import { ProgramRoleWidgetService } from "@api/program/facades/detail/program-role-widget.service";
const view = new URLSearchParams(location.search).get("view") || "participant";
const role = view.startsWith("organizer")
  ? "organizer"
  : view.startsWith("expert")
    ? "expert"
    : "participant";
const empty = view.endsWith("zero");
const widgetData: any = { programId: 12, role, isCompetitive: true };
widgetData.participant = {
  participantProject: empty
    ? null
    : {
        id: 5,
        name: view === "long" ? "Международный технологический проект ".repeat(15) : "StudyFlow",
        programLinkId: 34,
      },
  caseProvided: !empty,
  caseName: empty ? null : view === "long" ? "Цифровой сервис ".repeat(15) : "Цифровой сервис",
  stage: empty ? "none" : view === "draft" ? "not_submitted" : "review",
  submissionOpen: true,
};
widgetData.organizer = {
  participants: empty ? 0 : view === "organizer-large" ? 987654321 : 248,
  projects: empty ? 0 : 61,
  submittedSolutions: empty ? 0 : 54,
  participantsWithoutProject: empty ? 0 : 19,
};
widgetData.expert = {
  mode: view === "expert-open" ? "open" : "distributed",
  assigned: view === "expert-open" ? null : empty ? 0 : 7,
  remaining: view === "expert-open" ? null : empty || view === "expert-complete" ? 0 : 3,
  evaluationEnds: new Date(
    Date.now() + (view === "expert-overdue" ? -1 : 2) * 86400000,
  ).toISOString(),
};
const widgetState = signal<any>(
  view === "loading"
    ? { status: "loading" }
    : view === "error"
      ? { status: "failure", error: "network" }
      : view === "forbidden"
        ? { status: "failure", error: "forbidden" }
        : { status: "success", data: widgetData },
);
const noop = () => {};
const closed = (extra: object = {}) =>
  new Proxy(extra, { get: (target, key) => Reflect.get(target, key) ?? signal(false) });
const user = Object.assign(new User(), {
  id: 7,
  firstName: "Анна",
  lastName: "Иванова",
  avatar: "",
  personal: { avatar: "" },
});
const program = Object.assign(Program.default(), {
  id: 12,
  name: "Технологические команды",
  description: "Программа для развития технологических проектов и совместной работы участников.",
  isUserMember: role === "participant",
  isUserManager: role === "organizer",
  isUserExpert: role === "expert",
  links: [],
  materials: [],
  imageAddress: "",
  welcomeAcknowledgedAt: "2026-09-01T00:00:00Z",
});
const mainUI = new ProgramDetailMainUIInfoService();
mainUI.applyFormatingProgramData(program);
mainUI.registeredProgramModal.set(false);

@Component({
  selector: "smoke-shell",
  imports: [SidebarComponent],
  styleUrl: "../../../projects/social_platform/src/app/ui/pages/office/office.component.scss",
  styles: [":host { display:block; height:100%; }"],
  template: `<div class="office">
    <div class="office__wrapper">
      <img
        alt=""
        src="/assets/images/office/shared/backgorund-image-rocket-main.svg"
        class="office__background-image"
      />
      <div class="office__body">
        <div class="office__inner">
          <div class="office__inner--wrapper">
            <ui-sidebar
              class="office__sidebar"
              logoSrc="/assets/images/shared/logo.svg"
              [navItems]="nav"
            ></ui-sidebar>
            <div class="office__inner--content">
              <div class="office__top">
                <div></div>
                <div id="panel-slot"></div>
              </div>
              <div id="page-slot"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`,
})
class SmokeShell {
  nav = [
    { name: "Лента", icon: "feed", link: "/office/feed" },
    { name: "Проекты", icon: "folder", link: "/office/projects" },
    { name: "Программы", icon: "folder", link: "/office/program" },
  ];
}

TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
async function main() {
  TestBed.configureTestingModule({
    imports: [
      SmokeShell,
      ProfileControlPanelComponent,
      DeatilComponent,
      ProgramDetailMainComponent,
    ],
    providers: [
      provideRouter([]),
      provideZonelessChangeDetection(),
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: API_URL, useValue: "" },
      { provide: PRODUCTION, useValue: false },
      { provide: ProjectFormService, useValue: { getForm: () => new FormGroup({}) } },
      { provide: ChatStateService, useValue: { userOnlineStatusCache: of({}) } },
      {
        provide: DetailProgramInfoService,
        useValue: { applicationPending: signal(false), addNewProject: noop },
      },
      { provide: ProgramDetailMainUIInfoService, useValue: mainUI },
      {
        provide: ProjectAdditionalService,
        useValue: {
          isSend$: signal({ status: "initial" }),
          errorAssignProjectToProgramModalMessage: signal(null),
        },
      },
      { provide: NewsInfoService, useValue: { news: signal([]) } },
    ],
  });
  TestBed.overrideComponent(DeatilComponent, {
    set: {
      providers: [
        {
          provide: DetailInfoService,
          useValue: closed({
            info: signal(program),
            listType: signal("program"),
            userType: signal(1),
            isUserMember: signal(true),
            initializationDetail: noop,
            destroy: noop,
          }),
        },
        { provide: DetailProfileInfoService, useValue: closed() },
        {
          provide: DetailProgramInfoService,
          useValue: closed({ applicationLabel: signal("создать заявку") }),
        },
        { provide: DetailProjectInfoService, useValue: closed() },
        { provide: ProjectAdditionalService, useValue: {} },
      ],
    },
  });
  TestBed.overrideComponent(ProgramDetailMainComponent, {
    set: {
      providers: [
        {
          provide: ProgramDetailMainService,
          useValue: { initializationProgramDetailMain: noop, initScroll: noop, destroy: noop },
        },
        { provide: ExpandService, useValue: closed() },
      ],
    },
  });
  TestBed.overrideComponent(ProgramRoleWidgetComponent, {
    set: {
      providers: [
        {
          provide: ProgramRoleWidgetService,
          useValue: {
            state: widgetState,
            retry: () => widgetState.set({ status: "success", data: widgetData }),
            programId: signal(12),
          },
        },
      ],
    },
  });
  await TestBed.compileComponents();
  const mount = (component: any, slot: HTMLElement) => {
    const fixture = TestBed.createComponent(component);
    fixture.nativeElement.removeAttribute("id");
    slot.append(fixture.nativeElement);
    fixture.detectChanges();
    fixture.autoDetectChanges();
    return fixture;
  };
  mount(SmokeShell, document.body);
  const panel = TestBed.createComponent(ProfileControlPanelComponent);
  panel.componentRef.setInput("user", user);
  panel.componentRef.setInput("invites", []);
  document.getElementById("panel-slot")!.append(panel.nativeElement);
  panel.detectChanges();
  const header = mount(DeatilComponent, document.getElementById("page-slot")!);
  mount(
    ProgramDetailMainComponent,
    header.nativeElement.querySelector(".detail__body") ?? header.nativeElement,
  );
  await TestBed.inject(ApplicationRef).whenStable();
  document.body.dataset["ready"] = "true";
}
main().catch(error => {
  console.error(error);
  document.body.dataset["error"] = String(error);
});
