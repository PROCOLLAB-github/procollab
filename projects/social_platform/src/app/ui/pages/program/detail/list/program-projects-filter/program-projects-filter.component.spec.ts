/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { signal } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { ProgramProjectsFilterComponent } from "./program-projects-filter.component";
import { ProgramDetailListUIInfoService } from "@api/program/facades/detail/ui/program-detail-list-ui-info.service";
import { ProgramProjectsFilterInfoService } from "./service/program-projects-filter-info.service";

describe("ProjectsFilterComponent", () => {
  let component: ProgramProjectsFilterComponent;
  let fixture: ComponentFixture<ProgramProjectsFilterComponent>;
  const filters = signal<any[]>([]);
  const filterForm = new FormBuilder().group({ caseDirection: [null] });

  beforeEach(async () => {
    const programDetailListUIInfoServiceSpy = {
      listType: signal("projects"),
    };

    const programProjectsFilterInfoServiceSpy = {
      filterForm,
      filters,
      toggleAdditionalFormValues: vi.fn(),
      setValue: vi.fn(),
      clearFilters: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ProgramProjectsFilterComponent],
      providers: [provideRouter([])],
    })
      .overrideComponent(ProgramProjectsFilterComponent, {
        remove: {
          providers: [ProgramDetailListUIInfoService, ProgramProjectsFilterInfoService],
        },
        add: {
          providers: [
            {
              provide: ProgramDetailListUIInfoService,
              useValue: programDetailListUIInfoServiceSpy,
            },
            {
              provide: ProgramProjectsFilterInfoService,
              useValue: programProjectsFilterInfoServiceSpy,
            },
          ],
        },
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramProjectsFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("renders the expert case filter with readable semantic classes", () => {
    filters.set([
      {
        id: 1,
        name: "caseDirection",
        label: "Кейс",
        helpText: "Выберите кейс",
        fieldType: "select",
        options: ["Цифровая трансформация"],
      },
    ]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector(".filter__title").textContent.trim()).toBe(
      "фильтры",
    );
    expect(fixture.nativeElement.querySelector(".filter__clear").textContent.trim()).toBe(
      "cбросить",
    );
    expect(fixture.nativeElement.querySelector(".filter__select app-select")).not.toBeNull();
  });
});
