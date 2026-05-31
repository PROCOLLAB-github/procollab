/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { VacanciesDetailComponent } from "./vacancies-detail.component";
import { provideRouter } from "@angular/router";
import { VacancyDetailInfoService } from "@api/vacancy/facades/vacancy-detail-info.service";
import { VacancyDetailUIInfoService } from "@api/vacancy/facades/ui/vacancy-detail-ui-info.service";
import { ExpandService } from "@api/expand/expand.service";
import { signal } from "@angular/core";

describe("VacanciesDetailComponent", () => {
  let component: VacanciesDetailComponent;
  let fixture: ComponentFixture<VacanciesDetailComponent>;

  beforeEach(async () => {
    const vacancyDetailInfoServiceSpy = jasmine.createSpyObj("VacancyDetailInfoService", [
      "initializeDetailInfo",
      "destroy",
    ]);

    const vacancyDetailUIInfoServiceSpy = {
      vacancy: signal(undefined),
    };

    const expandServiceSpy = jasmine.createSpyObj("ExpandService", [], {
      expanded: signal({}),
    });

    await TestBed.configureTestingModule({
      imports: [VacanciesDetailComponent],
      providers: [provideRouter([])],
    })
      .overrideComponent(VacanciesDetailComponent, {
        remove: {
          providers: [VacancyDetailInfoService, VacancyDetailUIInfoService, ExpandService],
        },
        add: {
          providers: [
            { provide: VacancyDetailInfoService, useValue: vacancyDetailInfoServiceSpy },
            { provide: VacancyDetailUIInfoService, useValue: vacancyDetailUIInfoServiceSpy },
            { provide: ExpandService, useValue: expandServiceSpy },
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(VacanciesDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
