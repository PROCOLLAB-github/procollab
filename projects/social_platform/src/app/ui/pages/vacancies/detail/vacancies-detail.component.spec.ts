/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { VacanciesDetailComponent } from "./vacancies-detail.component";
import { provideRouter, Router } from "@angular/router";
import { VacancyDetailInfoService } from "@api/vacancy/facades/vacancy-detail-info.service";
import { VacancyDetailUIInfoService } from "@api/vacancy/facades/ui/vacancy-detail-ui-info.service";
import { ExpandService } from "@api/expand/expand.service";
import { signal } from "@angular/core";
import { Vacancy } from "@domain/vacancy/vacancy.model";

describe("VacanciesDetailComponent", () => {
  let component: VacanciesDetailComponent;
  let fixture: ComponentFixture<VacanciesDetailComponent>;
  const vacancy = signal<Vacancy | undefined>(undefined);

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

  it.each([
    "Разработчик".repeat(20),
    "Ведущий разработчик интерфейсов для международной платформы совместной работы ".repeat(3),
  ])("ограничивает длинное название в vacancy back и сохраняет полный текст: %s", role => {
    vacancy.set(Object.assign(new Vacancy(), { role }));
    fixture.detectChanges();

    const back = fixture.nativeElement.querySelector("app-back.detail__back") as HTMLElement;
    expect(back).not.toBeNull();
    expect(back.title).toBe(role);
    expect(back.querySelector(".back span")?.textContent).toBe(role);

    const navigate = vi.spyOn(TestBed.inject(Router), "navigateByUrl").mockResolvedValue(true);
    (back.querySelector(".back") as HTMLElement).click();
    expect(navigate).toHaveBeenCalledWith("/office/vacancies/all");
  });
});
