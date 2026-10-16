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
  const vacancy = signal<any>(undefined);

  beforeEach(async () => {
    vacancy.set(undefined);
    const vacancyDetailInfoServiceSpy = { initializeDetailInfo: vi.fn(), destroy: vi.fn() };

    const vacancyDetailUIInfoServiceSpy = {
      vacancy,
    };

    const expandServiceSpy = { expanded: signal({}) };

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

  it("использует роль вакансии как единственный заголовок страницы", () => {
    vacancy.set({ role: "Дизайнер", isActive: true, salary: "0" });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector("h1")?.textContent.trim()).toBe("Дизайнер");
    expect(fixture.nativeElement.querySelectorAll("h1")).toHaveLength(1);
  });
});
