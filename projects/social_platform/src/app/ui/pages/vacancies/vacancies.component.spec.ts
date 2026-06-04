/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { VacanciesComponent } from "./vacancies.component";
import { provideRouter } from "@angular/router";
import { VacancyInfoService } from "@api/vacancy/facades/vacancy-info.service";
import { VacancyUIInfoService } from "@api/vacancy/facades/ui/vacancy-ui-info.service";
import { VacancyFilterInfoService } from "@ui/widgets/vacancy-filter/service/vacancy-filter-info.service";
import { signal } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { of } from "rxjs";
import { VacancyRepositoryPort } from "@domain/vacancy/ports/vacancy.repository.port";

const vacancyRepositorySpy = {
  getVacancies: vi.fn().mockReturnValue(of({ results: [], count: 0, next: "", previous: "" })),
  getOne: vi.fn().mockReturnValue(of({})),
};

describe("VacanciesComponent", () => {
  let component: VacanciesComponent;
  let fixture: ComponentFixture<VacanciesComponent>;

  beforeEach(async () => {
    const vacancyInfoServiceSpy = {
      initializationSearchValueForm: vi.fn(),
      init: vi.fn(),
      destroy: vi.fn(),
      onSearchSubmit: vi.fn(),
    };

    const fb = new FormBuilder();
    const vacancyUIInfoServiceSpy = {
      searchForm: fb.group({ search: [""] }),
      listType: signal<"all" | "my" | null>("all"),
      applySearhValueChanged: vi.fn(),
    };

    const vacancyFilterInfoServiceSpy = {
      filterForm: fb.group({}),
      initFilterForm: vi.fn(),
      clearFilters: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [VacanciesComponent],
      providers: [
        provideRouter([]),
        { provide: VacancyFilterInfoService, useValue: vacancyFilterInfoServiceSpy },
        {
          provide: VacancyRepositoryPort,
          useValue: { getVacancies: () => of({ results: [], count: 0, next: "", previous: "" }) },
        },
      ],
    })
      .overrideComponent(VacanciesComponent, {
        remove: {
          providers: [VacancyInfoService, VacancyUIInfoService],
        },
        add: {
          providers: [
            { provide: VacancyInfoService, useValue: vacancyInfoServiceSpy },
            { provide: VacancyUIInfoService, useValue: vacancyUIInfoServiceSpy },
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(VacanciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
