/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { signal } from "@angular/core";
import { ProgramProjectsFilterComponent } from "./program-projects-filter.component";
import { ProgramDetailListUIInfoService } from "@api/program/facades/detail/ui/program-detail-list-ui-info.service";
import { ProgramProjectsFilterInfoService } from "./service/program-projects-filter-info.service";

describe("ProjectsFilterComponent", () => {
  let component: ProgramProjectsFilterComponent;
  let fixture: ComponentFixture<ProgramProjectsFilterComponent>;

  beforeEach(async () => {
    const programDetailListUIInfoServiceSpy = {
      listType: signal("projects"),
    };

    const programProjectsFilterInfoServiceSpy = {
      filterForm: signal(null),
      filters: signal([]),
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
});
