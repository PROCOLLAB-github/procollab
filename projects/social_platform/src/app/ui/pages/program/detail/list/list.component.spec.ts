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
      initializeSearchForm: jasmine.createSpy("initializeSearchForm"),
      initializationListData: jasmine.createSpy("initializationListData"),
      initScroll: jasmine.createSpy("initScroll"),
      destroy: jasmine.createSpy("destroy"),
    };

    const fb = new FormBuilder();
    const programDetailListUIInfoServiceSpy = {
      searchForm: fb.group({ search: [""] }),
      listType: signal("projects"),
      searchedList: signal([]),
      profileProjSubsIds: signal([]),
      routerLink: jasmine.createSpy("routerLink"),
      applySetAvailableFilters: jasmine.createSpy("applySetAvailableFilters"),
      isHintExpertsModal: signal(false),
    };

    const programProjectsFilterInfoServiceSpy = {
      initializationProgramProjectsFilter: jasmine.createSpy("initializationProgramProjectsFilter"),
      clearFilters: jasmine.createSpy("clearFilters"),
      filters: signal([]),
      filterForm: fb.group({}),
    };

    const exportFileInfoServiceSpy = {
      loadingExports$: signal(initial()),
      loadingExports: signal(false),
      downloadProjects: jasmine.createSpy("downloadProjects"),
      downloadSubmittedProjects: jasmine.createSpy("downloadSubmittedProjects"),
      downloadRates: jasmine.createSpy("downloadRates"),
    };

    const swipeServiceSpy = {
      isFilterOpen: signal(false),
      onSwipeStart: jasmine.createSpy("onSwipeStart"),
      onSwipeMove: jasmine.createSpy("onSwipeMove"),
      onSwipeEnd: jasmine.createSpy("onSwipeEnd"),
      closeFilter: jasmine.createSpy("closeFilter"),
    };

    const tooltipInfoServiceSpy = {
      isTooltipVisible: signal(false),
      toggleTooltip: jasmine.createSpy("toggleTooltip"),
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
