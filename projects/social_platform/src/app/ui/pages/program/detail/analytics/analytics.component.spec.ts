/** @format */

import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { ExportFileInfoService } from "@api/export-file/facades/export-file-info.service";
import { ProgramAnalyticsInfoService } from "@api/program/facades/detail/program-analytics-info.service";
import {
  ProgramAnalyticsData,
  ProgramAnalyticsOverview,
} from "@domain/program/program-analytics.model";
import { initial } from "@domain/shared/async-state";
import { ProgramAnalyticsComponent } from "./analytics.component";

function overview(overrides: Partial<ProgramAnalyticsOverview> = {}): ProgramAnalyticsOverview {
  return {
    program: { id: 12, name: "Программа" },
    registrations: { total: 20 },
    participants: { total: 18 },
    applications: {
      total: 12,
      byStatus: {
        draft: 2,
        submitted: 4,
        approved: 3,
        rejected: 1,
        withdrawn: 1,
        cancelled: 1,
      },
      byParticipationMode: { undecided: 1, individual: 4, team: 7 },
    },
    teams: { total: 3, acceptedMembers: 10 },
    submissions: {
      total: 9,
      byStatus: { draft: 2, submitted: 4, returned: 1, final: 2, cancelled: 0 },
      applicationsWithSubmittedSolution: 6,
    },
    expertAssignments: {
      total: 8,
      byStatus: { assigned: 3, completed: 4, revoked: 1 },
    },
    evaluations: { total: 5, byStatus: { draft: 2, submitted: 3 } },
    ...overrides,
  };
}

describe("ProgramAnalyticsComponent", () => {
  const data = signal<ProgramAnalyticsData | null>({ overview: overview(), projectCount: 7 });
  const pending = signal(false);
  const failed = signal(false);
  const error = signal<any>(null);
  const analytics = {
    data,
    pending,
    failed,
    error,
    initialize: vi.fn(),
    retry: vi.fn(),
  };
  const exports = {
    loadingExports$: signal(initial()),
    downloadProjects: vi.fn(),
    downloadSubmittedProjects: vi.fn(),
    downloadRates: vi.fn(),
  };

  beforeEach(() => {
    data.set({ overview: overview(), projectCount: 7 });
    pending.set(false);
    failed.set(false);
    error.set(null);
    analytics.initialize.mockClear();
    analytics.retry.mockClear();
    exports.downloadProjects.mockClear();
    exports.downloadSubmittedProjects.mockClear();
    exports.downloadRates.mockClear();

    TestBed.configureTestingModule({ imports: [ProgramAnalyticsComponent] })
      .overrideComponent(ProgramAnalyticsComponent, {
        set: {
          providers: [
            { provide: ProgramAnalyticsInfoService, useValue: analytics },
            { provide: ExportFileInfoService, useValue: exports },
          ],
        },
      })
      .compileComponents();
  });

  it("показывает summary, воронки, attention и activity внутри вкладки", () => {
    const fixture = TestBed.createComponent(ProgramAnalyticsComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(analytics.initialize).toHaveBeenCalledOnce();
    expect(root.querySelector('[data-testid="summary-participants"]')?.textContent).toContain("18");
    expect(root.querySelector('[data-testid="summary-projects"]')?.textContent).toContain("7");
    expect(root.querySelector('[data-testid="participant-funnel"]')).not.toBeNull();
    expect(root.querySelector('[data-testid="solution-funnel"]')).not.toBeNull();
    expect(root.querySelector('[data-testid="attention-block"]')).not.toBeNull();
    expect(root.querySelector('[data-testid="activity-dynamics"]')).not.toBeNull();
    expect(root.querySelectorAll('[data-testid="metric-tooltip"]').length).toBe(4);
  });

  it("показывает понятные zero states без пустых графиков", () => {
    const zero = overview({
      registrations: { total: 0 },
      participants: { total: 0 },
      applications: {
        total: 0,
        byStatus: {
          draft: 0,
          submitted: 0,
          approved: 0,
          rejected: 0,
          withdrawn: 0,
          cancelled: 0,
        },
        byParticipationMode: { undecided: 0, individual: 0, team: 0 },
      },
      teams: { total: 0, acceptedMembers: 0 },
      submissions: {
        total: 0,
        byStatus: { draft: 0, submitted: 0, returned: 0, final: 0, cancelled: 0 },
        applicationsWithSubmittedSolution: 0,
      },
      expertAssignments: {
        total: 0,
        byStatus: { assigned: 0, completed: 0, revoked: 0 },
      },
      evaluations: { total: 0, byStatus: { draft: 0, submitted: 0 } },
    });
    data.set({ overview: zero, projectCount: 0 });
    const fixture = TestBed.createComponent(ProgramAnalyticsComponent);

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain("пока нет данных для аналитики");
    expect(fixture.nativeElement.textContent).toContain("Пока нет данных по участникам");
    expect(fixture.nativeElement.textContent).toContain("Нет решений для отображения");
    expect(fixture.nativeElement.textContent).toContain("Нет данных для графика активности");
  });

  it("показывает loading и recoverable error", () => {
    pending.set(true);
    data.set(null);
    const fixture = TestBed.createComponent(ProgramAnalyticsComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="analytics-loading"]')).not.toBeNull();

    pending.set(false);
    failed.set(true);
    error.set({ kind: "network" });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="analytics-error"]')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain("Повторить");
  });

  it("использует существующие действия выгрузки", () => {
    const fixture = TestBed.createComponent(ProgramAnalyticsComponent);
    fixture.detectChanges();
    const buttons = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll("app-button"),
    );

    buttons
      .find(button => button.textContent?.includes("Все проекты"))
      ?.dispatchEvent(new Event("click"));
    buttons
      .find(button => button.textContent?.includes("Сданные проекты"))
      ?.dispatchEvent(new Event("click"));
    buttons
      .find(button => button.textContent?.includes("Оценки проектов"))
      ?.dispatchEvent(new Event("click"));

    expect(exports.downloadProjects).toHaveBeenCalledOnce();
    expect(exports.downloadSubmittedProjects).toHaveBeenCalledOnce();
    expect(exports.downloadRates).toHaveBeenCalledOnce();
  });
});
