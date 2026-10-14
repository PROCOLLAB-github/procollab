/** @format */

import { ComponentFixture, DeferBlockState, TestBed } from "@angular/core/testing";
import { provideRouter, Router, UrlTree } from "@angular/router";
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

import { DesktopLayoutService } from "../../../../../../../../ui/src/lib/services/desktop-layout.service";

import { Project } from "@domain/project/project.model";
import { projectCardFixture } from "@ui/widgets/info-card/info-card.fixture";
import { IndustryRepositoryPort } from "@domain/industry/ports/industry.repository.port";
import { AddProjectSubscriptionUseCase } from "@api/project/use-cases/add-project-subscription.use-case";
import { DeleteProjectSubscriptionUseCase } from "@api/project/use-cases/delete-project-subscription.use-case";
import { ok } from "@domain/shared/result.type";

describe("ProgramListComponent", () => {
  let component: ProgramListComponent;
  let fixture: ComponentFixture<ProgramListComponent>;
  const projects = signal<Project[]>([]);
  const desktop = signal(true);
  const listType = signal("projects");

  beforeEach(async () => {
    projects.set([]);
    desktop.set(true);
    listType.set("projects");
    const programDetailListInfoServiceSpy = {
      initializeSearchForm: vi.fn(),
      initializationListData: vi.fn(),
      initScroll: vi.fn(),
      destroy: vi.fn(),
    };

    const fb = new FormBuilder();
    const programDetailListUIInfoServiceSpy = {
      searchForm: fb.group({ search: [""] }),
      listType,
      searchedList: projects,
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
      providers: [
        provideRouter([]),
        { provide: DesktopLayoutService, useValue: { desktop } },
        { provide: IndustryRepositoryPort, useValue: { getOne: () => ({ name: "Образование" }) } },
        {
          provide: AddProjectSubscriptionUseCase,
          useValue: { execute: vi.fn(() => of(ok(undefined))) },
        },
        {
          provide: DeleteProjectSubscriptionUseCase,
          useValue: { execute: vi.fn(() => of(ok(undefined))) },
        },
      ],
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
  it("проект программы открывается одной ссылкой без вложенной кнопки подписки", () => {
    projects.set([projectCardFixture()]);
    fixture.detectChanges();
    const card = fixture.nativeElement.querySelector("app-info-card") as HTMLElement;
    const link = card.querySelector<HTMLAnchorElement>(".card__project-link")!;
    expect(card.closest("a")).toBeNull();
    expect(card.querySelector("a a, a button, a [tabindex]")).toBeNull();
    expect(link.getAttribute("href")).toBe("/office/projects/101");
    expect(link.querySelector(".card__project-action")?.textContent?.trim()).toBe("Открыть");
    expect(card.querySelector(".card__subscription-action")?.closest("a")).toBeNull();
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, "navigateByUrl").mockResolvedValue(true);
    try {
      link.querySelector<HTMLElement>(".card__project-action")!.click();
      expect(navigate).toHaveBeenCalledOnce();
      expect(router.serializeUrl(navigate.mock.calls[0][0] as UrlTree)).toBe(
        "/office/projects/101",
      );
    } finally {
      navigate.mockRestore();
    }
  });
  it.each(["projects", "rating"])(
    "opens the mobile %s filter and closes it with Escape",
    async type => {
      desktop.set(false);
      listType.set(type);
      (component as any).appWidth = 390;
      fixture.detectChanges();
      fixture.nativeElement.querySelector(".page__mobile-controls app-button button").click();
      fixture.detectChanges();
      const blocks = await fixture.getDeferBlocks();
      expect(blocks).toHaveLength(1);
      await blocks[0].render(DeferBlockState.Complete);
      fixture.detectChanges();
      await new Promise(resolve => setTimeout(resolve));
      const dialog = document.querySelector(
        '[role="dialog"][aria-labelledby="program-list-filter-title"]',
      );
      expect(dialog?.querySelector("app-program-projects-filter")).not.toBeNull();
      dialog!.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      fixture.detectChanges();
      await new Promise(resolve => setTimeout(resolve));
      expect(document.querySelector('[aria-labelledby="program-list-filter-title"]')).toBeNull();
    },
  );
});
