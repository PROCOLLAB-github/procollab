/** @format */
/// <reference types="jasmine" />

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { signal } from "@angular/core";
import { VacanciesListComponent } from "./list.component";
import { VacancyInfoService } from "@api/vacancy/facades/vacancy-info.service";
import { VacancyUIInfoService } from "@api/vacancy/facades/ui/vacancy-ui-info.service";

describe("VacanciesListComponent", () => {
  let component: VacanciesListComponent;
  let fixture: ComponentFixture<VacanciesListComponent>;
  let vacancyInfoService: jasmine.SpyObj<VacancyInfoService>;
  let vacancyUIInfoService: jasmine.SpyObj<VacancyUIInfoService>;

  beforeEach(async () => {
    const infServiceSpy = jasmine.createSpyObj<VacancyInfoService>("VacancyInfoService", [
      "init",
      "initScroll",
    ]);

    const uiServiceSpy = jasmine.createSpyObj<VacancyUIInfoService>("VacancyUIInfoService", [], {
      listType: signal("all"),
      vacancyList: signal([]), // Пустой список по умолчанию
      responsesList: signal([]),
      isMyModal: signal(false),
    });

    await TestBed.configureTestingModule({
      imports: [VacanciesListComponent],
      providers: [
        { provide: VacancyInfoService, useValue: infServiceSpy },
        { provide: VacancyUIInfoService, useValue: uiServiceSpy },
      ],
    }).compileComponents();

    vacancyInfoService = TestBed.inject(VacancyInfoService) as jasmine.SpyObj<VacancyInfoService>;
    vacancyUIInfoService = TestBed.inject(
      VacancyUIInfoService
    ) as jasmine.SpyObj<VacancyUIInfoService>;

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
});
