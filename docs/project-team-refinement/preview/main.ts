/** @format */
import "@angular/compiler";
import { HttpErrorResponse } from "@angular/common/http";
import { Component, provideZonelessChangeDetection, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { BrowserTestingModule, platformBrowserTesting } from "@angular/platform-browser/testing";
import { ActivatedRoute, provideRouter } from "@angular/router";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import { provideNgxMask } from "ngx-mask";
import { defer, map, of, throwError, timer } from "rxjs";
import { ProjectTeamStepComponent } from "@ui/pages/projects/edit/components/project-team-step/project-team-step.component";
import { ProjectTeamUIService } from "@api/project/facades/edit/ui/project-team-ui.service";
import { ProjectTeamService } from "@api/project/facades/edit/project-team.service";
import { ProjectsEditInfoService } from "@api/project/facades/edit/projects-edit-info.service";
import { ProfileInfoService } from "@api/profile/facades/profile-info.service";
import { GetMembersUseCase } from "@api/member/use-cases/get-members.use-case";
import { RemoveProjectCollaboratorUseCase } from "@api/project/use-cases/remove-project-collaborator.use-case";
import { InviteRepositoryPort } from "@domain/invite/ports/invite.repository.port";
import { SnackbarService } from "@domain/shared/snackbar.service";
import { userFromRaw } from "@utils/userRaw";
import { Collaborator } from "@domain/project/collaborator.model";
import { Invite } from "@domain/invite/invite.model";

const state = new URLSearchParams(location.search).get("state") ?? "main";
const long = state === "long";
const names = [
  ["Алексей", "Куделько"],
  ["Анна", "Смирнова"],
  ["Михаил", "Орлов"],
  ["Иван", "Тест"],
  ["Екатерина-Александра", "Константинопольская-Рождественская"],
  ["Дмитрий", "Соколов"],
];
const users = names.map(([firstName, lastName], i) =>
  userFromRaw({
    id: i + 1,
    firstName,
    lastName,
    avatar: "",
    birthday: "2000-05-14",
    speciality: "Продуктовый аналитик",
    skills: [],
  }),
);
const members: Collaborator[] = users.slice(0, 3).map((user, i) => ({
  userId: user.id,
  firstName: long && i === 1 ? names[4][0] : user.firstName,
  lastName: long && i === 1 ? names[4][1] : user.lastName,
  role:
    long && i === 1
      ? "Менеджер по работе с партнёрами и развитию образовательных программ"
      : ["Основатель", "Продуктовый дизайнер", "Frontend-разработчик"][i],
  avatar: "",
  skills: [],
}));
const invites = [3, 4].map(
  (i): Invite =>
    ({
      id: 80 + i,
      user: users[i],
      role:
        i === 3
          ? "Product Manager"
          : "Менеджер по работе с партнёрами и развитию образовательных программ",
      specialization: "legacy",
      isAccepted: null,
      datetimeCreated: "2026-09-28T12:00:00Z",
    }) as unknown as Invite,
);
const calls: unknown[] = [];
const toast = signal("");
let ui: ProjectTeamUIService;
let sendCount = 0;
const repo = {
  sendForUser: (userId: number, projectId: number, role: string, specialization?: string) => {
    calls.push({ action: "send", userId, projectId, role, specialization });
    // Первая попытка в error fixture возвращает настоящий HTTP error mapper.
    return defer(() =>
      state === "error" && sendCount++ === 0
        ? throwError(() => new HttpErrorResponse({ status: 500 }))
        : timer(450).pipe(
            map(
              () =>
                ({
                  id: 90,
                  user: users.find(user => user.id === userId)!,
                  role,
                  specialization,
                  isAccepted: null,
                  datetimeCreated: "2026-09-28T12:00:00Z",
                }) as unknown as Invite,
            ),
          ),
    );
  },
  updateInvite: (id: number, role: string, specialization?: string) => {
    calls.push({ action: "edit", id, role, specialization });
    return of({ ...invites.find(invite => invite.id === id), role, specialization });
  },
  revokeInvite: (id: number) => {
    calls.push({ action: "revoke", id });
    return of(undefined);
  },
};
function initialize() {
  ui.applySetInvites(
    ["empty", "zero"].includes(state)
      ? []
      : ["pending", "long"].includes(state)
        ? invites
        : [invites[0]],
  );
  ui.applySetCollaborators(
    state === "zero" ? [] : ["empty", "pending"].includes(state) ? [members[0]] : members,
  );
}
@Component({
  selector: "app-team-preview",
  imports: [ProjectTeamStepComponent],
  template: `
    <main>
      <div class="preview-shell" aria-label="Оболочка редактора">
        <h1>‹ &nbsp; редактировать проект</h1>
        <div class="preview-tabs">
          основные данные · партнёры и ресурсы · достижения · вакансии · <span>команда</span> ·
          данные для конкурса
        </div>
      </div>
      <app-project-team-step />
      <aside class="preview-controls" aria-label="Управление тестовыми данными">
        <p>Локальные fixtures · реальные Angular-компоненты · без серверной записи</p>
        <nav>
          @for (item of states; track item) {
            <a [href]="'?state=' + item">{{ item }}</a>
          }
        </nav>
        @if (state === "loading") {
          <button type="button" (click)="initialize()">Завершить загрузку</button>
        }
      </aside>
    </main>
    @if (toast()) {
      <p class="preview-toast" role="status">{{ toast() }}</p>
    }
  `,
  styles: [
    `
      main {
        max-width: 1040px;
        margin: 40px auto;
        padding: 0 40px;
        box-sizing: border-box;
      }
      .preview-shell {
        margin-bottom: 24px;
      }
      h1 {
        font-size: 18px;
        font-weight: 400;
        line-height: 27px;
        margin: 0 0 40px;
      }
      .preview-tabs {
        font-size: 12px;
        line-height: 24px;
        color: var(--grey-for-text);
        padding-bottom: 20px;
        border-bottom: 1px solid var(--medium-grey-for-outline);
      }
      .preview-tabs span {
        color: var(--black);
      }
      .preview-controls {
        margin-top: 80px;
        border-top: 1px solid var(--medium-grey-for-outline);
        padding-top: 16px;
        font-size: 12px;
        color: var(--grey-for-text);
      }
      .preview-controls nav {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
        margin: 12px 0;
      }
      .preview-toast {
        pointer-events: none;
        position: fixed;
        bottom: 12px;
        left: 12px;
        right: 12px;
        padding: 12px;
        background: var(--white);
        color: var(--black);
        border: 1px solid var(--accent);
        font-size: 12px;
      }
      @media (width < 750px) {
        main {
          margin: 24px auto;
          padding: 0 16px;
        }
        h1 {
          margin-bottom: 24px;
        }
      }
    `,
  ],
})
class Preview {
  state = state;
  states = ["main", "empty", "zero", "pending", "loading", "long", "error"];
  toast = toast;
  initialize = initialize;
}
TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
TestBed.configureTestingModule({
  imports: [Preview],
  providers: [
    provideZonelessChangeDetection(),
    provideRouter([]),
    provideNoopAnimations(),
    provideNgxMask(),
    ProjectTeamService,
    ProjectTeamUIService,
    {
      provide: ProjectsEditInfoService,
      useValue: {
        profileId: signal(5),
        invitationProject: signal({ id: 5, leader: 1, partnerProgram: null }),
      },
    },
    { provide: ProfileInfoService, useValue: { profile: signal({ id: 1 }) } },
    { provide: InviteRepositoryPort, useValue: repo },
    { provide: ActivatedRoute, useValue: { snapshot: { params: { projectId: "5" } } } },
    {
      provide: SnackbarService,
      useValue: {
        success: (message: string) => toast.set(message),
        error: (message: string) => toast.set(message),
      },
    },
    {
      provide: RemoveProjectCollaboratorUseCase,
      useValue: {
        execute: (projectId: number, userId: number) => {
          calls.push({ action: "remove", projectId, userId });
          return of({ ok: true, value: userId });
        },
      },
    },
    {
      provide: GetMembersUseCase,
      useValue: {
        execute: (_skip: number, _take: number, query: { fullname: string }) =>
          timer(350).pipe(
            map(() => ({
              ok: true,
              value: {
                results: users.filter(user =>
                  (user.firstName + " " + user.lastName)
                    .toLocaleLowerCase()
                    .includes(query.fullname.toLocaleLowerCase()),
                ),
              },
            })),
          ),
      },
    },
  ],
});
TestBed.compileComponents().then(async () => {
  ui = TestBed.inject(ProjectTeamUIService);
  if (state !== "loading") initialize();
  const fixture = TestBed.createComponent(Preview);
  document.body.appendChild(fixture.nativeElement);
  fixture.autoDetectChanges();
  (window as unknown as { teamPreviewCalls: unknown[] }).teamPreviewCalls = calls;
});
