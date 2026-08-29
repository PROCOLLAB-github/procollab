/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { signal } from "@angular/core";
import { VacanciesListComponent } from "./list.component";
import { VacancyInfoService } from "@api/vacancy/facades/vacancy-info.service";
import { VacancyUIInfoService } from "@api/vacancy/facades/ui/vacancy-ui-info.service";
import { provideRouter } from "@angular/router";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { ProjectSubscriptionRepositoryPort } from "@domain/project/ports/project-subscription.repository.port";
import { of } from "rxjs";

describe("VacanciesListComponent", () => {
  let component: VacanciesListComponent;
  let fixture: ComponentFixture<VacanciesListComponent>;
  let vacancyInfoService: any;
  let vacancyUIInfoService: any;

  beforeEach(async () => {
    const infServiceSpy = { init: vi.fn(), initScroll: vi.fn(), destroy: vi.fn() };

    const uiServiceSpy = {
      listType: signal("all"),
      vacancyList: signal<any[]>([]),
      responsesList: signal<any[]>([]),
      isMyModal: signal(false),
    };

    await TestBed.configureTestingModule({
      imports: [VacanciesListComponent],
      providers: [
        provideRouter([]),
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

  it("не показывает empty-state при непустом списке моих откликов", () => {
    vacancyUIInfoService.listType.set("my");
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
  });

  it("показывает empty-state для пустого списка моих откликов", () => {
    vacancyUIInfoService.listType.set("my");
    vacancyUIInfoService.responsesList.set([]);

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain("в данном разделе пока нет ваших откликов");
  });
});
