/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { signal } from "@angular/core";
import { VacanciesListComponent } from "./list.component";
import { VacancyInfoService } from "@api/vacancy/facades/vacancy-info.service";
import { VacancyUIInfoService } from "@api/vacancy/facades/ui/vacancy-ui-info.service";
import { provideRouter, Router, RouterLink } from "@angular/router";
import { By } from "@angular/platform-browser";
import { DesktopLayoutService } from "@uilib";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { ProjectSubscriptionRepositoryPort } from "@domain/project/ports/project-subscription.repository.port";
import { of } from "rxjs";

describe("VacanciesListComponent", () => {
  let component: VacanciesListComponent;
  let fixture: ComponentFixture<VacanciesListComponent>;
  let vacancyInfoService: any;
  let vacancyUIInfoService: any;
  let desktop: ReturnType<typeof signal<boolean>>;

  beforeEach(async () => {
    desktop = signal(true);
    const infServiceSpy = { init: vi.fn(), initScroll: vi.fn(), destroy: vi.fn() };

    const uiServiceSpy = {
      listType: signal("all"),
      vacancyList: signal<any[]>([]),
      responsesList: signal<any[]>([]),
      isMyModal: signal(false),
      vacancies$: signal<any>({ status: "initial" }),
    };

    await TestBed.configureTestingModule({
      imports: [VacanciesListComponent],
      providers: [
        provideRouter([]),
        { provide: DesktopLayoutService, useValue: { desktop } },
        {
          provide: AuthRepositoryPort,
          useValue: {
            fetchProfile: vi.fn().mockReturnValue(of({ id: 1 })),
          },
        },
        {
          provide: ProjectSubscriptionRepositoryPort,
          useValue: { getSubscriptions: of({ results: [], count: 0 }) },
        },
      ],
    })
      .overrideComponent(VacanciesListComponent, {
        remove: {
          providers: [VacancyInfoService, VacancyUIInfoService],
        },
        add: {
          providers: [
            { provide: VacancyInfoService, useValue: infServiceSpy },
            { provide: VacancyUIInfoService, useValue: uiServiceSpy },
          ],
        },
      })
      .compileComponents();

    vacancyInfoService = infServiceSpy;
    vacancyUIInfoService = uiServiceSpy;

    fixture = TestBed.createComponent(VacanciesListComponent);
    component = fixture.componentInstance;
  });

  it("должен вызвать vacancyInfoService.init() при инициализации компонента", () => {
    fixture.detectChanges();

    expect(vacancyInfoService.init).toHaveBeenCalledTimes(1);
  });

  it("должен вызвать vacancyInfoService.initScroll() с элементом при ngAfterViewInit", () => {
    const scrollElement = document.createElement("div");
    scrollElement.className = "office__body";
    document.body.appendChild(scrollElement);

    fixture.detectChanges();
    fixture.detectChanges();

    expect(vacancyInfoService.initScroll).toHaveBeenCalled();

    document.body.removeChild(scrollElement);
  });

  it("должен иметь доступ к сигналам из vacancyUIInfoService", () => {
    fixture.detectChanges();

    expect(component["type"]).toBeDefined();
    expect(component["vacancyList"]).toBeDefined();
    expect(component["responsesList"]).toBeDefined();
    expect(component["isMyModal"]).toBeDefined();
  });

  it("should create", () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it("показывает отсутствие результатов только после успешного пустого ответа", () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain("Вакансий пока нет");
    vacancyUIInfoService.vacancies$.set({ status: "loading" });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain("Вакансий пока нет");
    vacancyUIInfoService.vacancies$.set({ status: "success", data: [] });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("Вакансий пока нет");
  });

  for (const isDesktop of [true, false]) {
    it(`не предлагает сброс для пустого списка без фильтров (${isDesktop ? "desktop" : "mobile"})`, async () => {
      desktop.set(isDesktop);
      await TestBed.inject(Router).navigate([], {
        queryParams: { unrelated: "value", role_contains: "   " },
      });
      vacancyUIInfoService.vacancies$.set({ status: "success", data: [] });
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain("Вакансий пока нет");
      expect(fixture.nativeElement.textContent).not.toContain("Сбросить фильтры");
      expect(fixture.nativeElement.textContent).not.toContain("Измените поиск");
    });

    it(`показывает состояние активного поиска и сохраняет один путь сброса (${isDesktop ? "desktop" : "mobile"})`, async () => {
      desktop.set(isDesktop);
      await TestBed.inject(Router).navigate([], { queryParams: { role_contains: "аналитик" } });
      vacancyUIInfoService.vacancies$.set({ status: "success", data: [] });
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain("Вакансии не найдены");
      const reset = fixture.debugElement.query(By.directive(RouterLink));
      if (isDesktop) {
        expect(reset).toBeNull();
      } else {
        expect(reset.nativeElement.textContent).toContain("Сбросить фильтры");
        expect(reset.injector.get(RouterLink).urlTree?.toString()).toBe("/office/vacancies/all");
      }

      await TestBed.inject(Router).navigate([], { queryParams: {} });
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain("Вакансий пока нет");
      expect(fixture.nativeElement.textContent).not.toContain("Сбросить фильтры");
    });
  }

  for (const key of ["required_experience", "work_format", "work_schedule", "salary"]) {
    it(`учитывает примененный фильтр ${key} без поиска`, async () => {
      desktop.set(false);
      await TestBed.inject(Router).navigate([], { queryParams: { [key]: "0" } });
      vacancyUIInfoService.vacancies$.set({ status: "success", data: [] });
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain("Вакансии не найдены");
      expect(fixture.nativeElement.textContent).toContain("Сбросить фильтры");
    });
  }

  it("не показывает empty-state вакансий при непустом списке моих откликов и активном query", async () => {
    await TestBed.inject(Router).navigate([], { queryParams: { role_contains: "аналитик" } });
    vacancyUIInfoService.listType.set("my");
    vacancyUIInfoService.vacancies$.set({ status: "success", data: [] });
    vacancyUIInfoService.responsesList.set([
      {
        id: 1,
        vacancy: {
          id: 2,
          role: "Разработчик",
          project: { id: 3, name: "Проект" },
        },
        whyMe: "Сопроводительное письмо",
        isApproved: null,
        accompanyingFile: null,
        datetimeCreated: "2026-08-28T12:00:00Z",
      },
    ]);

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain(
      "в данном разделе пока нет ваших откликов",
    );
    expect(fixture.nativeElement.textContent).toContain("Разработчик");
    expect(fixture.nativeElement.textContent).not.toContain("Вакансий пока нет");
    expect(fixture.nativeElement.textContent).not.toContain("Вакансии не найдены");
    expect(fixture.nativeElement.textContent).not.toContain("Сбросить фильтры");
  });

  it("показывает только состояние откликов при пустом списке и активном query", async () => {
    await TestBed.inject(Router).navigate([], { queryParams: { work_format: "remote" } });
    vacancyUIInfoService.listType.set("my");
    vacancyUIInfoService.vacancies$.set({ status: "success", data: [] });
    vacancyUIInfoService.responsesList.set([]);

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain("У вас пока нет откликов");
    expect(fixture.nativeElement.textContent).not.toContain("Вакансии не найдены");
    expect(fixture.nativeElement.textContent).not.toContain("Вакансий пока нет");
  });
});
