/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { signal } from "@angular/core";
import { of } from "rxjs";
import { FormBuilder } from "@angular/forms";
import { initial } from "@domain/shared/async-state";
import { ProgramListComponent } from "./list.component";
import { ProgramDetailListInfoService } from "@api/program/facades/detail/program-detail-list-info.service";
import { ProgramDetailListUIInfoService } from "@api/program/facades/detail/ui/program-detail-list-ui-info.service";
import { ProgramProjectsFilterInfoService } from "./program-projects-filter/service/program-projects-filter-info.service";
import { ExportFileInfoService } from "@api/export-file/facades/export-file-info.service";
import { SwipeService } from "@api/swipe/swipe.service";
import { TooltipInfoService } from "@api/tooltip/tooltip-info.service";

describe("ProgramListComponent", () => {
  let component: ProgramListComponent;
  let fixture: ComponentFixture<ProgramListComponent>;

  beforeEach(async () => {
    const programDetailListInfoServiceSpy = {
      initializeSearchForm: vi.fn(),
      initializationListData: vi.fn(),
      initScroll: vi.fn(),
      destroy: vi.fn(),
    };

    const fb = new FormBuilder();
    const programDetailListUIInfoServiceSpy = {
      searchForm: fb.group({ search: [""] }),
      listType: signal("projects"),
      searchedList: signal([]),
      profileProjSubsIds: signal([]),
      routerLink: vi.fn(),
      applySetAvailableFilters: vi.fn(),
      isHintExpertsModal: signal(false),
    };

    const programProjectsFilterInfoServiceSpy = {
      initializationProgramProjectsFilter: vi.fn(),
      clearFilters: vi.fn(),
      filters: signal([]),
      filterForm: fb.group({}),
    };

    const exportFileInfoServiceSpy = {
      loadingExports$: signal(initial()),
      loadingExports: signal(false),
      downloadProjects: vi.fn(),
      downloadSubmittedProjects: vi.fn(),
      downloadRates: vi.fn(),
    };

    const swipeServiceSpy = {
      isFilterOpen: signal(false),
      onSwipeStart: vi.fn(),
      onSwipeMove: vi.fn(),
      onSwipeEnd: vi.fn(),
      closeFilter: vi.fn(),
    };

    const tooltipInfoServiceSpy = {
      isTooltipVisible: signal<Record<string, boolean>>({}),
      isVisible: vi.fn().mockReturnValue(false),
      show: vi.fn(),
      hide: vi.fn(),
      toggleTooltip: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ProgramListComponent],
      providers: [provideRouter([])],
    })
      .overrideComponent(ProgramListComponent, {
        remove: {
          providers: [
            ProgramDetailListInfoService,
            ProgramDetailListUIInfoService,
            ProgramProjectsFilterInfoService,
            ExportFileInfoService,
            SwipeService,
            TooltipInfoService,
          ],
        },
        add: {
          providers: [
            { provide: ProgramDetailListInfoService, useValue: programDetailListInfoServiceSpy },
            {
              provide: ProgramDetailListUIInfoService,
              useValue: programDetailListUIInfoServiceSpy,
            },
            {
              provide: ProgramProjectsFilterInfoService,
              useValue: programProjectsFilterInfoServiceSpy,
            },
            { provide: ExportFileInfoService, useValue: exportFileInfoServiceSpy },
            { provide: SwipeService, useValue: swipeServiceSpy },
            { provide: TooltipInfoService, useValue: tooltipInfoServiceSpy },
          ],
        },
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
