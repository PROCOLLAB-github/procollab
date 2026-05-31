/// <reference types="jasmine" />

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { signal } from "@angular/core";
import { VacanciesListComponent } from "./list.component";
import { VacancyInfoService } from "@api/vacancy/facades/vacancy-info.service";
import { VacancyUIInfoService } from "@api/vacancy/facades/ui/vacancy-ui-info.service";
import { provideRouter } from "@angular/router";

describe("VacanciesListComponent", () => {
  let component: VacanciesListComponent;
  let fixture: ComponentFixture<VacanciesListComponent>;
  let vacancyInfoService: jasmine.SpyObj<VacancyInfoService>;
  let vacancyUIInfoService: any;

  beforeEach(async () => {
    const infServiceSpy = jasmine.createSpyObj<VacancyInfoService>("VacancyInfoService", [
      "init",
      "initScroll",
      "destroy",
    ]);

    const uiServiceSpy = {
      listType: signal("all"),
      vacancyList: signal([]),
      responsesList: signal([]),
      isMyModal: signal(false),
    };

    await TestBed.configureTestingModule({
      imports: [VacanciesListComponent],
      providers: [
        provideRouter([]),
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
});
