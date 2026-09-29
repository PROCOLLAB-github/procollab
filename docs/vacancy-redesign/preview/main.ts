/** @format */

import "@angular/compiler";
import { Component, inject, provideZonelessChangeDetection, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { BrowserTestingModule, platformBrowserTesting } from "@angular/platform-browser/testing";
import { provideRouter, Router, RouterOutlet, RouterLink } from "@angular/router";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import { HttpClient, provideHttpClient } from "@angular/common/http";
import { FormBuilder } from "@angular/forms";
import { of, Subject } from "rxjs";
import { provideNgxMask } from "ngx-mask";
import { ValidationService, API_URL, FileService } from "@corelib";
import { ProjectVacancyStepComponent } from "@ui/pages/projects/edit/components/project-vacancy-step/project-vacancy-step.component";
import { ProjectVacancyService } from "@api/project/facades/edit/project-vacancy.service";
import { ProjectVacancyUIService } from "@api/project/facades/edit/ui/project-vacancy-ui.service";
import { ProjectFormService } from "@api/project/facades/edit/project-form.service";
import { ProjectsEditUIInfoService } from "@api/project/facades/edit/ui/projects-edit-ui-info.service";
import { ProjectsEditInfoService } from "@api/project/facades/edit/projects-edit-info.service";
import { ToggleFieldsInfoService } from "@api/toggle-fields/toggle-fields-info.service";
import { SearchesService } from "@api/searches/searches.service";
import { SkillsRepositoryPort } from "@domain/skills/ports/skills.repository.port";
import { GetSpecializationsInlineUseCase } from "@api/specializations/use-cases/get-specializations-inline.use-case";
import { PostVacancyUseCase } from "@api/vacancy/use-cases/post-vacancy.use-case";
import { UpdateVacancyUseCase } from "@api/vacancy/use-cases/update-vacancy.use-case";
import { DeleteVacancyUseCase } from "@api/vacancy/use-cases/delete-vacancy.use-case";
import { GetVacanciesUseCase } from "@api/vacancy/use-cases/get-vacancies.use-case";
import { VacanciesComponent } from "@ui/pages/vacancies/vacancies.component";
import { VacanciesListComponent } from "@ui/pages/vacancies/list/list.component";
import { VacanciesDetailComponent } from "@ui/pages/vacancies/detail/vacancies-detail.component";
import { VacancyInfoComponent } from "@ui/pages/vacancies/detail/info/info.component";
import { VacancyUIInfoService } from "@api/vacancy/facades/ui/vacancy-ui-info.service";
import { VacancyInfoService } from "@api/vacancy/facades/vacancy-info.service";
import { VacancyDetailUIInfoService } from "@api/vacancy/facades/ui/vacancy-detail-ui-info.service";
import { VacancyDetailInfoService } from "@api/vacancy/facades/vacancy-detail-info.service";
import { SendVacancyResponseUseCase } from "@api/vacancy/use-cases/send-vacancy-response.use-case";
import { GetVacancyResponsesUseCase } from "@api/vacancy/use-cases/get-vacancy-responses.use-case";
import { AcceptResponseUseCase } from "@api/vacancy/use-cases/accept-response.use-case";
import { RejectResponseUseCase } from "@api/vacancy/use-cases/reject-response.use-case";
import { DownloadCvUseCase } from "@api/auth/use-cases/download-cv.use-case";
import { SnackbarService } from "@domain/shared/snackbar.service";
import { ExpandService } from "@api/expand/expand.service";
import { Vacancy } from "@domain/vacancy/vacancy.model";
import { VacancyResponse } from "@domain/vacancy/vacancy-response.model";
import { ok, fail } from "@domain/shared/result.type";
import { success } from "@domain/shared/async-state";

const params = new URLSearchParams(location.search);
const stress = params.has("stress");
const skills = [
  "TypeScript",
  "Angular",
  "Проектирование пользовательских интерфейсов",
  "SCSS",
  "JavaScript",
  "Figma",
  "Git",
  "CSS",
  "HTML",
  "Командная работа",
  "Аналитика",
].map((name, id) => ({
  id,
  name: stress && id === 2 ? "ОченьДлинныйНавыкБезПробелов".repeat(9) : name,
  category: { id: 1, name: id === 9 ? "Soft skills" : "Hard skills" },
  approves: [],
}));
const project = {
  id: 5,
  name: stress
    ? "ОченьДлинноеНазваниеПроектаБезПробелов".repeat(6)
    : "PROCOLLAB — платформа для совместных проектов",
  imageAddress: "/assets/images/profile/main.svg",
  links: ["https://procollab.ru"],
};
const vacancy = (id: number, overrides: Partial<Vacancy> = {}) =>
  Object.assign(new Vacancy(), {
    id,
    role: "Frontend-разработчик Angular",
    isActive: true,
    project,
    requiredSkills: skills,
    description:
      "Развиваем платформу, которая помогает находить команду и запускать проекты. Ищем разработчика, которому интересно делать сложные сценарии простыми.\n\nВы будете создавать новые интерфейсы, работать с дизайн-системой и улучшать доступность приложения. Вместе обсудим задачи и выберем удобный ритм работы.",
    salary: "120000",
    city: "Москва",
    workFormat: "удаленная работа",
    requiredExperience: "от 1 года до 3 лет",
    workSchedule: "гибкий график",
    specialization: "Разработчик",
    canManageResponses: true,
    datetimeCreated: "2026-09-29T10:00:00Z",
    ...overrides,
  });
const vacancies = [
  vacancy(10, {
    role: stress
      ? "ОченьДлинноеНазваниеВакансииБезПробелов".repeat(10)
      : "Frontend-разработчик для развития образовательной платформы PROCOLLAB",
  }),
  vacancy(11, {
    role: "QA",
    description: "",
    requiredSkills: [],
    canManageResponses: false,
    canRespond: true,
    salary: "0",
    specialization: undefined,
  }),
  vacancy(12, {
    role: "Дизайнер",
    requiredSkills: skills.slice(2, 3),
    isActive: false,
    canManageResponses: false,
  }),
  vacancy(13, {
    role: "Аналитик",
    requiredSkills: skills.slice(0, 1),
    isActive: false,
    canManageResponses: false,
  }),
];
const response = (id: number, approved: boolean | null) =>
  Object.assign(new VacancyResponse(), {
    id,
    vacancy: vacancies[0],
    isApproved: approved,
    datetimeCreated: "2026-09-29T10:00:00Z",
    whyMe:
      id === 2
        ? ""
        : "Хочу участвовать в развитии PROCOLLAB. Два года работаю с Angular и TypeScript, проектирую доступные интерфейсы и пишу тесты.\nГотов обсудить задачи и показать примеры своих работ." +
          (id === 3 || stress
            ? "\nРаботал над сложными формами, адаптивными страницами и командными инструментами. ".repeat(
                15,
              )
            : ""),
    accompanyingFile:
      id === 2
        ? null
        : {
            name: stress ? "ПодробноеРезюмеКандидата".repeat(10) + ".pdf" : "Резюме.pdf",
            link: "/assets/vacancy-fixture.pdf",
            size: 1024,
            mimeType: "application/pdf",
            extension: "pdf",
          },
    user: {
      id,
      firstName: stress ? "ОченьДлинноеИмяКандидата".repeat(6) : "Анна",
      lastName: "Смирнова",
      avatar: "/assets/images/profile/main.svg",
      specialization: { id: 1, name: "Frontend-разработчик" },
      skills,
      aboutMe: "",
    },
  });
let responses = [response(1, null), response(2, true), response(3, false)];
let request = new Subject<any>();
let calls = 0;
let lastCreatePayload: any;
const previewEditProvider = {
  provide: ProjectsEditInfoService,
  useFactory: () => {
    const openGroupIds = signal(new Set<number>());
    const hasOpenSkillsGroups = signal(false);
    return {
      profileId: signal(5),
      nestedSkills$: of([{ id: 1, name: "Разработка", skills }]),
      openGroupIds,
      hasOpenSkillsGroups,
      onGroupToggled(open: boolean, id: number) {
        openGroupIds.set(new Set(open ? [id] : []));
        hasOpenSkillsGroups.set(open);
      },
    };
  },
};
const listInfo = {
  initializationSearchValueForm() {},
  init() {},
  destroy() {},
  initScroll() {},
  onSearchSubmit() {},
};
@Component({
  selector: "app-project-preview",
  imports: [ProjectVacancyStepComponent],
  template: '<h1 class="preview-heading">Вакансии проекта</h1><app-project-vacancy-step />',
})
class ProjectPreview {}
@Component({
  selector: "app-vacancy-preview",
  imports: [RouterOutlet, RouterLink],
  template: `<header class="preview-bar">
      <span>PROCOLLAB</span><span>Локальная проверка · тестовые данные</span>
    </header>
    <div class="preview-shell">
      <nav class="preview-nav" aria-label="Разделы">
        <a routerLink="/office/projects/5/edit">Проект</a
        ><a routerLink="/office/vacancies/all">Вакансии</a
        ><a routerLink="/office/vacancies/my">Мои отклики</a>
      </nav>
      <main class="preview-main"><router-outlet /></main>
    </div>`,
  styles: [
    `
      :host {
        display: block;
        color: var(--black);
      }
      .preview-bar {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        justify-content: space-between;
        padding: 20px 32px;
        border-bottom: 1px solid var(--medium-grey-for-outline);
        font-size: 12px;
      }
      .preview-bar > :first-child {
        color: var(--accent-dark);
        font-weight: 600;
        font-size: 18px;
      }
      .preview-shell {
        display: grid;
        grid-template-columns: 180px minmax(0, 1fr);
        gap: 32px;
        max-width: 1400px;
        margin: auto;
        padding: 0 32px 32px;
      }
      .preview-nav {
        display: flex;
        flex-direction: column;
        gap: 24px;
        padding-top: 32px;
        font-size: 14px;
      }
      .preview-nav a {
        color: var(--accent-dark);
      }
      .preview-main {
        min-width: 0;
      }
      :host ::ng-deep .preview-heading {
        margin: 24px 0;
        font-size: 24px;
        font-weight: 700;
        line-height: 36px;
      }
      @media (max-width: 800px) {
        .preview-bar {
          padding: 16px;
        }
        .preview-shell {
          grid-template-columns: minmax(0, 1fr);
          gap: 0;
          padding: 0 16px 24px;
        }
        .preview-nav {
          flex-direction: row;
          flex-wrap: wrap;
          gap: 16px;
          padding-top: 20px;
        }
      }
    `,
  ],
})
class Preview {}
TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
TestBed.configureTestingModule({
  imports: [Preview],
  providers: [
    provideZonelessChangeDetection(),
    provideNoopAnimations(),
    provideHttpClient(),
    provideNgxMask(),
    provideRouter([
      { path: "office/projects/5/edit", component: ProjectPreview },
      {
        path: "office/vacancies/all",
        component: VacanciesComponent,
        children: [{ path: "", component: VacanciesListComponent }],
      },
      {
        path: "office/vacancies/my",
        component: VacanciesComponent,
        children: [{ path: "", component: VacanciesListComponent }],
      },
      {
        path: "office/vacancies/:vacancyId",
        component: VacanciesDetailComponent,
        children: [{ path: "", component: VacancyInfoComponent }],
      },
      { path: "**", redirectTo: "office/vacancies/all" },
    ]),
    FormBuilder,
    ValidationService,
    ProjectVacancyService,
    ProjectVacancyUIService,
    VacancyUIInfoService,
    VacancyDetailUIInfoService,
    VacancyDetailInfoService,
    ExpandService,
    ToggleFieldsInfoService,
    { provide: API_URL, useValue: "/fixture-api/" },
    {
      provide: FileService,
      useValue: { uploadFile: () => of({ url: "/assets/vacancy-fixture.pdf" }) },
    },
    { provide: SnackbarService, useValue: { success() {}, error() {} } },
    { provide: ProjectFormService, useValue: { editIndex: signal<number | null>(null) } },
    { provide: ProjectsEditUIInfoService, useValue: { onEditClicked: signal(false) } },
    SearchesService,
    { provide: GetSpecializationsInlineUseCase, useValue: {} },
    {
      provide: SkillsRepositoryPort,
      useFactory: () => {
        const http = inject(HttpClient);
        return {
          getSkillsInline: (name: string) =>
            http.get("/fixture-api/core/skills/inline/", { params: { name__icontains: name } }),
          getSkillsNested: () => of([{ id: 1, name: "Разработка", skills }]),
        };
      },
    },
    previewEditProvider,
    {
      provide: PostVacancyUseCase,
      useValue: {
        execute(_projectId: number, payload: any) {
          lastCreatePayload = payload;
          calls++;
          request = new Subject();
          return request;
        },
      },
    },
    {
      provide: UpdateVacancyUseCase,
      useValue: {
        execute: (id: number, payload: any) =>
          of(
            ok(
              vacancy(id, {
                ...payload,
                requiredSkills: skills.filter(skill =>
                  payload.requiredSkillsIds.includes(skill.id),
                ),
              }),
            ),
          ),
      },
    },
    { provide: DeleteVacancyUseCase, useValue: { execute: () => of(ok(undefined)) } },
    { provide: GetVacanciesUseCase, useValue: { execute: () => of(ok(vacancies)) } },
    { provide: SendVacancyResponseUseCase, useValue: { execute: () => of(ok(undefined)) } },
    { provide: GetVacancyResponsesUseCase, useValue: { execute: () => of(ok(responses)) } },
    {
      provide: AcceptResponseUseCase,
      useValue: {
        execute: (id: number) => {
          responses = responses.map(r => ({
            ...r,
            isApproved: r.id === id ? true : r.isApproved === null ? false : r.isApproved,
          }));
          return of(ok(undefined));
        },
      },
    },
    {
      provide: RejectResponseUseCase,
      useValue: {
        execute: (id: number) => {
          responses = responses.map(r => (r.id === id ? { ...r, isApproved: false } : r));
          return of(ok(undefined));
        },
      },
    },
    { provide: DownloadCvUseCase, useValue: { execute: () => of(ok(new Blob())) } },
  ],
});
for (const component of [VacanciesComponent, VacanciesListComponent]) {
  TestBed.overrideComponent(component, {
    set: { providers: [{ provide: VacancyInfoService, useValue: listInfo }] },
  });
}
TestBed.overrideComponent(VacanciesDetailComponent, { set: { providers: [] } });
TestBed.overrideComponent(ProjectVacancyStepComponent, {
  set: { providers: [SearchesService, ProjectVacancyService, previewEditProvider] },
});
TestBed.compileComponents().then(async () => {
  const list = TestBed.inject(VacancyUIInfoService);
  const detail = TestBed.inject(VacancyDetailUIInfoService);
  const projectUi = TestBed.inject(ProjectVacancyUIService);
  list.listType.set(location.pathname.endsWith("/my") ? "my" : "all");
  list.vacancies$.set(success(params.has("empty") ? [] : vacancies));
  list.responsesList.set(params.has("empty") ? [] : responses);
  detail.applySetVacancies(vacancies[0]);
  projectUi.applySetVacancies(vacancies);
  const fixture = TestBed.createComponent(Preview);
  document.body.appendChild(fixture.nativeElement);
  fixture.autoDetectChanges();
  const router = TestBed.inject(Router);
  router.events.subscribe(() =>
    list.listType.set(router.url.split("?")[0].endsWith("/my") ? "my" : "all"),
  );
  await router.navigateByUrl(location.pathname + location.search);
  await fixture.whenStable();
  (window as any).__vacancyPreview = {
    fixture,
    router,
    list,
    detail,
    projectUi,
    rootSearch: TestBed.inject(SearchesService),
    fill() {
      TestBed.inject(ToggleFieldsInfoService).showFields();
      projectUi.vacancyForm.patchValue({
        role: "Новая вакансия Angular",
        skills: skills.slice(0, 3),
        description: "Создана в локальном сценарии проверки.",
        requiredExperience: "без опыта",
        workFormat: "удаленная работа",
        workSchedule: "гибкий график",
        salary: "120000",
      });
    },
    submit() {
      TestBed.inject(ProjectVacancyService).submitVacancy(5);
    },
    succeed() {
      request.next(
        ok(
          vacancy(99, {
            role: "Новая вакансия Angular",
            requiredSkills: skills.filter(skill =>
              lastCreatePayload.requiredSkillsIds.includes(skill.id),
            ),
          }),
        ),
      );
      request.complete();
    },
    fail() {
      request.next(fail({ code: "fixture_error" }));
      request.complete();
    },
    get calls() {
      return calls;
    },
    openResponses() {
      TestBed.inject(VacancyDetailInfoService).openVacancyResponses();
    },
    emptyDetail() {
      detail.applySetVacancies(
        vacancy(10, {
          description: "",
          requiredSkills: [],
          city: null,
          workFormat: "",
          workSchedule: "",
          salary: "",
        }),
      );
    },
  };
});
