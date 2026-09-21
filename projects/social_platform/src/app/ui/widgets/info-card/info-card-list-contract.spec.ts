/** @format */

import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { provideRouter, Router, RouterLink } from "@angular/router";
import { firstValueFrom, of } from "rxjs";
import { API_URL, CamelcaseInterceptor } from "@corelib";
import { GetMyProjectsUseCase } from "@api/project/use-cases/get-my-projects.use-case";
import { AddProjectSubscriptionUseCase } from "@api/project/use-cases/add-project-subscription.use-case";
import { DeleteProjectSubscriptionUseCase } from "@api/project/use-cases/delete-project-subscription.use-case";
import { AppRoutes } from "@api/paths/app-routes";
import { IndustryRepositoryPort } from "@domain/industry/ports/industry.repository.port";
import { ProjectRepositoryPort } from "@domain/project/ports/project.repository.port";
import { Project } from "@domain/project/project.model";
import { ok } from "@domain/shared/result.type";
import { ProjectRepository } from "@infrastructure/repository/project/project.repository";
import { InfoCardComponent } from "./info-card.component";

describe("Мои проекты: HTTP list → преобразование контракта → карточка", () => {
  let fixture: ComponentFixture<InfoCardComponent>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoCardComponent],
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: HTTP_INTERCEPTORS, useClass: CamelcaseInterceptor, multi: true },
        { provide: API_URL, useValue: "/api" },
        { provide: ProjectRepositoryPort, useClass: ProjectRepository },
        { provide: IndustryRepositoryPort, useValue: { getOne: () => undefined } },
        { provide: AddProjectSubscriptionUseCase, useValue: { execute: () => of(ok(undefined)) } },
        {
          provide: DeleteProjectSubscriptionUseCase,
          useValue: { execute: () => of(ok(undefined)) },
        },
        provideRouter([]),
      ],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(InfoCardComponent);
    fixture.componentRef.setInput("appereance", "my");
    fixture.componentRef.setInput("loggedUserId", 7);
  });

  afterEach(() => http.verify());

  /**
   * Передаёт настоящий сокращённый snake_case payload через HTTP/interceptor,
   * адаптер, репозиторий и use case. Готовая camelCase-фикстура скрыла бы дефект.
   */
  async function loadProject(submitted: boolean | undefined, draft = false): Promise<void> {
    const resultPromise = firstValueFrom(TestBed.inject(GetMyProjectsUseCase).execute());
    const request = http.expectOne("/api/auth/users/projects/");
    expect(request.request.method).toBe("GET");
    request.flush({
      count: 1,
      next: null,
      previous: null,
      results: [
        {
          id: 101,
          name: "Проект программы",
          leader: 7,
          short_description: "Описание проекта",
          image_address: "/assets/images/projects/shared/idea.svg",
          industry: 1,
          views_count: 0,
          draft,
          is_company: false,
          partner_program: {
            id: 12,
            name: "Программа",
            ...(submitted === undefined
              ? {}
              : { program_link_id: 120, program_id: 12, is_submitted: submitted }),
          },
        },
      ],
    });
    const result = await resultPromise;
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("Список проектов не загружен");
    const project = result.value.results[0];
    expect(project).toBeInstanceOf(Project);
    expect(project.shortDescription).toBe("Описание проекта");
    expect(project.partnerProgram?.isSubmitted).toBe(submitted);
    if (submitted !== undefined) {
      expect(project.partnerProgram?.programLinkId).toBe(120);
      expect(project.partnerProgram?.programId).toBe(12);
    }
    fixture.componentRef.setInput("info", project);
    fixture.detectChanges();
  }

  const text = (selector: string): string =>
    fixture.nativeElement.querySelector(selector)?.textContent?.trim();

  it.each([
    { submitted: true, draft: false, status: "Сдан в программу" },
    { submitted: true, draft: true, status: "Сдан в программу" },
    { submitted: false, draft: false, status: "В программе" },
    { submitted: false, draft: true, status: "Черновик" },
    { submitted: undefined, draft: false, status: "В программе" },
    { submitted: undefined, draft: true, status: "Черновик" },
  ])("is_submitted=$submitted, draft=$draft: lifecycle и доступ независимы", async item => {
    await loadProject(item.submitted, item.draft);
    for (const userId of [7, 99, undefined]) {
      fixture.componentRef.setInput("loggedUserId", userId);
      fixture.detectChanges();
      expect(text(".card__status")).toBe(item.status);
      expect(text(".card__role")).toBe(userId === 7 ? "Лидер" : "Участник");
      expect(text(".card__access-label")).toBe(
        userId === 7 && item.submitted === false ? "можно редактировать" : "только просмотр",
      );
      expect(text(".card__project-action")).toBe("Открыть");
      const link = fixture.debugElement.query(By.directive(RouterLink)).injector.get(RouterLink);
      expect(TestBed.inject(Router).serializeUrl(link.urlTree!)).toBe(
        AppRoutes.projects.detail(101),
      );
      expect(link.urlTree!.queryParams).toEqual({});
    }
  });

  it("обновляет доступ после получения состояния и не сохраняет его для неполного ответа", async () => {
    for (const submitted of [undefined, false, true, undefined]) {
      await loadProject(submitted);
      expect(text(".card__access-label")).toBe(
        submitted === false ? "можно редактировать" : "только просмотр",
      );
    }
  });
});
