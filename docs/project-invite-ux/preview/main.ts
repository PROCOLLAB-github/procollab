/** @format */

import "@angular/compiler";
import { Component, inject, provideZonelessChangeDetection, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { BrowserTestingModule, platformBrowserTesting } from "@angular/platform-browser/testing";
import { ActivatedRoute, provideRouter } from "@angular/router";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import { provideHttpClient, HttpErrorResponse } from "@angular/common/http";
import { FormBuilder } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { provideNgxMask } from "ngx-mask";
import { BehaviorSubject, Subject, timer, map, throwError, of } from "rxjs";
import { DeatilComponent } from "@ui/widgets/detail/detail.component";
import { DetailProfileInfoService } from "@ui/widgets/detail/services/profile/detail-profile-info.service";
import { DetailInfoService } from "@ui/widgets/detail/services/detail-info.service";
import { DetailProjectInfoService } from "@ui/widgets/detail/services/project/detail-project-info.service";
import { DetailProgramInfoService } from "@ui/widgets/detail/services/program/detail-program-info.service";
import { ProfileDetailUIInfoService } from "@api/profile/facades/detail/ui/profile-detail-ui-info.service";
import { ProfileInfoService } from "@api/profile/facades/profile-info.service";
import { ProjectAdditionalService } from "@api/project/facades/edit/project-additional.service";
import { ProjectFormService } from "@api/project/project-form.service";
import { ProjectTeamStepComponent } from "@ui/pages/projects/edit/components/project-team-step/project-team-step.component";
import { ProjectTeamUIService } from "@api/project/facades/edit/ui/project-team-ui.service";
import { ProjectTeamService } from "@api/project/facades/edit/project-team.service";
import { ProjectsEditInfoService } from "@api/project/facades/edit/projects-edit-info.service";
import { TooltipInfoService } from "@api/tooltip/tooltip-info.service";
import { GetMembersUseCase } from "@api/member/use-cases/get-members.use-case";
import { RemoveProjectCollaboratorUseCase } from "@api/project/use-cases/remove-project-collaborator.use-case";
import { InviteRepositoryPort } from "@domain/invite/ports/invite.repository.port";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { DownloadCvUseCase } from "@api/auth/use-cases/download-cv.use-case";
import { ChatStateService } from "@domain/shared/chat-state.service";
import { SnackbarService } from "@domain/shared/snackbar.service";
import { userFromRaw } from "@utils/userRaw";

const params = new URLSearchParams(location.search);
const projectCount = +(params.get("projects") ?? "12");
const names = [
  "Тестирование пути пользователя",
  "Разработка платформы",
  "Аналитика и исследования",
  "Маркетинг PROCOLLAB",
  "Новый продукт",
  "Автоматизация процессов",
  "Исследование аудитории",
  "Дизайн сервиса",
  "Образование и технологии",
  "Запуск пилотного продукта",
  "Коммуникации",
  "Долгосрочное исследование промышленных партнёрств и развитие технологических проектов в регионах",
];
const projects = names.slice(0, projectCount).map((name, i) => ({
  id: i + 1,
  name,
  shortDescription: i % 2 ? "Продукт и технологии" : "Исследование и развитие",
  imageAddress: "",
  numberOfCollaborators: (i % 5) + 2,
}));
const users = [
  "Иван Петров",
  "Мария Иванова",
  "Иван Соколов",
  "Иван Кузнецов",
  "Екатерина Иванова",
  "Анна Смирнова",
  "Дмитрий Иванов",
  "Иван Александров",
].map((name, i) =>
  userFromRaw({
    id: i + 10,
    firstName: name.split(" ")[0],
    lastName: name.split(" ")[1],
    avatar: "",
    birthday: "2000-05-14",
    speciality: ["Продуктовый аналитик", "UI/UX дизайнер", "Backend-разработчик"][i % 3],
    skills: [
      { id: 1, name: "Аналитика" },
      { id: 2, name: "SQL" },
      { id: 3, name: "Исследования" },
    ] as any,
  }),
);
const viewed = {
  ...users[0],
  avatar: "/assets/images/profile/main.svg",
  skills: [],
  coverImageAddress: "",
  speciality: "Продуктовый аналитик",
  name: "Иван Петров",
};
const fallback = (overrides: any = {}) =>
  new Proxy(overrides, {
    get(target, key) {
      if (key in target) return target[key];
      if (typeof key !== "string" || key === "then") return undefined;
      return (target[key] = signal(false));
    },
  });
const detail = fallback({
  info: signal(viewed),
  listType: signal("profile"),
  initializationDetail() {},
  destroy() {},
});
let teamUI: any;
const response = new Subject<any>();
const toast = signal("");
const calls: any[] = [];
const project = {
  id: 5,
  leader: 10,
  partnerProgram: params.has("global") ? null : { programId: 27, programLinkId: 81 },
};
const projectContext = signal<any>(project);
const repo = {
  sendForUser: (...args: any[]) => {
    calls.push(args);
    return response;
  },
  update: () => of({}),
  revoke: () => of({}),
};
@Component({
  selector: "app-invite-preview",
  imports: [DeatilComponent, ProjectTeamStepComponent],
  template: `
    <header class="preview-nav">
      <img src="/assets/images/shared/logo.svg" alt="PROCOLLAB" /><span>Главная</span
      ><span>Проекты</span><span>Участники</span>
    </header>
    <main>
      @if (mode === "team") {
        <h1>Команда проекта</h1>
        <p class="intro">Разработка платформы · Редактирование проекта</p>
        <app-project-team-step />
      } @else {
        <app-detail />
        <div class="profile-background">
          <article>
            <h2>Информация</h2>
            <p>Продуктовый аналитик</p>
            <p>Москва · Открыт к проектам</p>
          </article>
          <article>
            <h2>О себе</h2>
            <p>Исследую продукты и помогаю командам находить решения.</p>
          </article>
        </div>
      }
    </main>
    @if (toast()) {
      <div class="preview-toast" role="status">{{ toast() }}</div>
    }
  `,
  styles: [
    `
      .preview-nav {
        display: flex;
        align-items: center;
        gap: 32px;
        padding: 22px 36px;
        color: var(--grey-for-text);
        font-size: 13px;
        border-bottom: 1px solid var(--grey);
      }
      .preview-nav img {
        width: 160px;
        margin-right: 20px;
      }
      main {
        max-width: 1320px;
        margin: 28px auto;
        padding: 0 24px;
      }
      h1 {
        font-size: 24px;
        margin: 0 0 10px;
      }
      .intro {
        color: var(--grey-for-text);
        margin-bottom: 32px;
        font-size: 14px;
      }
      .profile-background {
        display: grid;
        grid-template-columns: 1fr 2fr;
        gap: 24px;
        margin-top: 24px;
      }
      article {
        border: 1px solid var(--grey);
        border-radius: 12px;
        padding: 24px;
        min-height: 220px;
      }
      article h2 {
        font-size: 16px;
        margin-bottom: 24px;
      }
      article p {
        font-size: 13px;
        line-height: 1.8;
      }
      .preview-toast {
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        padding: 16px 24px;
        background: var(--accent);
        color: white;
        border-radius: 10px;
        z-index: 30000;
      }
      @media (max-width: 600px) {
        .preview-nav {
          padding: 16px;
          gap: 12px;
        }
        .preview-nav img {
          width: 120px;
          margin: 0;
        }
        .preview-nav span {
          display: none;
        }
        main {
          padding: 0 12px;
        }
        .profile-background {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
class Preview {
  mode = params.get("mode");
  toast = toast;
}
TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
TestBed.configureTestingModule({
  imports: [Preview],
  providers: [
    provideZonelessChangeDetection(),
    provideRouter([]),
    provideNoopAnimations(),
    provideNgxMask(),
    provideHttpClient(),
    ProjectTeamService,
    { provide: ProjectTeamUIService, useFactory: () => (teamUI ??= new ProjectTeamUIService()) },
    {
      provide: ProjectsEditInfoService,
      useValue: { profileId: signal(5), invitationProject: projectContext },
    },
    {
      provide: TooltipInfoService,
      useValue: { haveHint: () => false, isVisible: () => false, tooltipPosition: signal("right") },
    },
    { provide: ProjectFormService, useValue: { getForm: () => new FormBuilder().group({}) } },
    {
      provide: ProfileInfoService,
      useValue: {
        profile: signal({ id: 1, personal: { userType: 1 } }),
        leaderProjects: signal(projects),
        ensureLeaderProjectsLoaded() {},
      },
    },
    { provide: InviteRepositoryPort, useValue: repo },
    { provide: AuthRepositoryPort, useValue: {} },
    { provide: DownloadCvUseCase, useValue: {} },
    {
      provide: ActivatedRoute,
      useValue: {
        snapshot: { params: { id: "10", projectId: "5" } },
        data: of({}),
        params: of({ id: "10", projectId: "5" }),
        queryParams: of({}),
      },
    },
    { provide: SnackbarService, useValue: { success: (message: string) => toast.set(message) } },
    { provide: ChatStateService, useValue: { userOnlineStatusCache: new BehaviorSubject({}) } },
    { provide: RemoveProjectCollaboratorUseCase, useValue: {} },
    {
      provide: GetMembersUseCase,
      useValue: {
        execute: (skip: number, take: number, query: any) => {
          (window as any).__searchCalls.push({ skip, take, query });
          const list =
            query.fullname === "Нет" ? [] : query.fullname === "Мария" ? [users[1]] : users;
          return timer(query.fullname === "Медленно" ? 3000 : 500).pipe(
            map(() => ({ ok: true, value: { results: list, count: list.length } })),
          );
        },
      },
    },
  ],
}).overrideComponent(DeatilComponent, {
  set: {
    providers: [
      DetailProfileInfoService,
      ProfileDetailUIInfoService,
      { provide: ProjectTeamUIService, useFactory: () => (teamUI ??= new ProjectTeamUIService()) },
      { provide: DetailInfoService, useValue: detail },
      { provide: DetailProjectInfoService, useValue: fallback() },
      { provide: DetailProgramInfoService, useValue: fallback() },
      { provide: ProjectAdditionalService, useValue: {} },
    ],
  },
});
(window as any).__searchCalls = [];
TestBed.compileComponents().then(async () => {
  const fixture = TestBed.createComponent(Preview);
  document.body.appendChild(fixture.nativeElement);
  fixture.autoDetectChanges();
  const profileElement = fixture.debugElement.query(By.directive(DeatilComponent));
  const profile = profileElement?.injector.get(DetailProfileInfoService);
  profile?.profileProjects.set(projects as any);
  if (params.get("mode") === "team") {
    teamUI.collaborators.set([
      {
        userId: 11,
        firstName: "Мария",
        lastName: "Иванова",
        role: "UI/UX дизайнер",
        avatar: "/assets/images/profile/main.svg",
        skills: [],
      },
    ]);
    teamUI.invites.set([
      { id: 80, user: users[2], role: "Backend-разработчик", specialization: "", isAccepted: null },
    ]);
  }
  (window as any).__invitePreview = {
    fixture,
    profile,
    teamUI,
    users,
    projects,
    projectContext,
    calls,
    response,
    toast,
    fail: () =>
      response.error(
        new HttpErrorResponse({
          status: 400,
          error: { user: ["У пользователя уже есть активное приглашение в этот проект."] },
        }),
      ),
    success: () =>
      response.next({
        id: 90,
        user: users.find(user => user.id === calls.at(-1)?.[0]),
        role: calls.at(-1)?.[2],
        isAccepted: null,
      }),
  };
});
