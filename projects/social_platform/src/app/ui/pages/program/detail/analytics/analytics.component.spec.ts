/** @format */

import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { ExportFileInfoService } from "@api/export-file/facades/export-file-info.service";
import { ProgramAnalyticsInfoService } from "@api/program/facades/detail/program-analytics-info.service";
import { ProgramAnalyticsOverview } from "@domain/program/program-analytics.model";
import { initial } from "@domain/shared/async-state";
import { ProgramAnalyticsComponent } from "./analytics.component";

function activity(count = 30, allZero = false): ProgramAnalyticsOverview["activity"] {
  return Array.from({ length: count }, (_, index) => ({
    date: `2026-08-${String(index + 1).padStart(2, "0")}`,
    registrations: allZero ? 0 : index % 4,
    submittedSolutions: allZero ? 0 : index % 3,
  }));
}

function overview(overrides: Partial<ProgramAnalyticsOverview> = {}): ProgramAnalyticsOverview {
  return {
    summary: {
      participants: { total: 18 },
      projects: { total: 7 },
      experts: { total: 4 },
      regions: {
        total: 2,
        items: [
          { name: "Москва", count: 5 },
          { name: "Казань", count: 2 },
        ],
      },
    },
    participantFunnel: {
      registrations: 20,
      uniqueParticipants: 18,
      withTeam: 12,
      projectCreators: 7,
      submittedProjectCreators: 6,
    },
    solutionFunnel: { created: 7, notSubmitted: 1, submitted: 6, evaluated: 4 },
    evaluationStatus: {
      mode: "open",
      maxEvaluationsPerProject: 3,
      assignments: { total: 8, pending: 3, evaluated: 5 },
      projects: {
        submitted: 6,
        awaitingEvaluation: 2,
        partiallyEvaluated: 0,
        evaluated: 4,
      },
    },
    attention: { participantsWithoutTeam: 6, projectsAwaitingEvaluation: 2 },
    activity: activity(),
    ...overrides,
  };
}

describe("ProgramAnalyticsComponent", () => {
  const data = signal<ProgramAnalyticsOverview | null>(overview());
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
    data.set(overview());
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

  it("показывает authoritative summary и реальный разрез регионов", () => {
    const fixture = TestBed.createComponent(ProgramAnalyticsComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(analytics.initialize).toHaveBeenCalledOnce();
    expect(root.querySelector('[data-testid="summary-participants"]')?.textContent).toContain("18");
    expect(root.querySelector('[data-testid="summary-projects"]')?.textContent).toContain("7");
    expect(root.querySelector('[data-testid="summary-experts"]')?.textContent).toContain(
      "Эксперты",
    );
    expect(root.querySelector('[data-testid="summary-experts"]')?.textContent).toContain("4");
    expect(root.querySelector('[data-testid="summary-regions"]')?.textContent).toContain("2");
    expect(root.querySelector('[data-testid="regions-breakdown"]')?.textContent).toContain(
      "Москва",
    );
    expect(root.querySelector('[data-testid="regions-breakdown"]')?.textContent).toContain(
      "Казань",
    );
    expect(root.querySelectorAll('[data-testid="metric-tooltip"]').length).toBe(4);
  });

  it("строит воронки только из participantFunnel и solutionFunnel", () => {
    const fixture = TestBed.createComponent(ProgramAnalyticsComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const participants = root.querySelector('[data-testid="participant-funnel"]')?.textContent;
    const solutions = root.querySelector('[data-testid="solution-funnel"]')?.textContent;

    expect(participants).toContain("Зарегистрировались");
    expect(participants).toContain("Уникальные участники");
    expect(participants).toContain("В команде");
    expect(participants).toContain("Создали проект");
    expect(participants).toContain("Сдали проект");
    expect(solutions).toContain("Создано");
    expect(solutions).toContain("Черновик / не сдано");
    expect(solutions).toContain("Сдано");
    expect(solutions).toContain("Оценено");
  });

  it("в open mode показывает статусы проектов без partial и трактует max как лимит", () => {
    const fixture = TestBed.createComponent(ProgramAnalyticsComponent);
    fixture.detectChanges();
    const evaluation = (fixture.nativeElement as HTMLElement).querySelector(
      '[data-testid="evaluation-statuses"]',
    );

    expect(evaluation?.textContent).toContain("Открытое оценивание");
    expect(evaluation?.querySelector(".analytics-card__title")?.textContent).toContain(
      "Статус оценивания",
    );
    expect(evaluation?.textContent).toContain("Ожидают оценивания");
    expect(evaluation?.textContent).not.toContain("Частично оценено");
    expect(evaluation?.textContent).toContain("Максимум экспертов на проект");
    expect(evaluation?.textContent).not.toContain("требуется 3");
    expect(evaluation?.querySelector(".status-list--projects")).not.toBeNull();
    expect(evaluation?.querySelectorAll(".status-list--projects li strong").length).toBe(3);
    expect(evaluation?.querySelector('[data-testid="assignment-statuses"]')).toBeNull();
  });

  it("в distributed mode показывает partial и отдельную статистику назначений", () => {
    const base = overview();
    data.set({
      ...base,
      evaluationStatus: {
        ...base.evaluationStatus,
        mode: "distributed",
        projects: {
          submitted: 6,
          awaitingEvaluation: 2,
          partiallyEvaluated: 1,
          evaluated: 3,
        },
      },
    });
    const fixture = TestBed.createComponent(ProgramAnalyticsComponent);
    fixture.detectChanges();
    const evaluation = (fixture.nativeElement as HTMLElement).querySelector(
      '[data-testid="evaluation-statuses"]',
    );

    expect(evaluation?.textContent).toContain("Распределённое оценивание");
    expect(evaluation?.textContent).toContain("Частично оценено");
    expect(evaluation?.querySelector('[data-testid="assignment-statuses"]')?.textContent).toContain(
      "Назначений всего",
    );
  });

  it("использует attention backend напрямую, без frontend approximation", () => {
    const base = overview();
    data.set({
      ...base,
      summary: { ...base.summary, participants: { total: 100 } },
      attention: { participantsWithoutTeam: 3, projectsAwaitingEvaluation: 1 },
    });
    const fixture = TestBed.createComponent(ProgramAnalyticsComponent);
    fixture.detectChanges();
    const attention = (fixture.nativeElement as HTMLElement).querySelector(
      '[data-testid="attention-block"]',
    );

    expect(attention?.textContent).toContain("Участники без команды");
    expect(attention?.textContent).toContain("3");
    expect(attention?.textContent).toContain("Работы ожидают оценивания");
    expect(attention?.textContent).not.toContain("97");
    expect(attention?.querySelectorAll(".attention__list li").length).toBe(2);
    expect(attention?.querySelectorAll(".attention__list li strong").length).toBe(2);
  });

  it("строит две серии по всем 30 точкам activity", () => {
    const fixture = TestBed.createComponent(ProgramAnalyticsComponent);
    fixture.detectChanges();
    const chart = (fixture.nativeElement as HTMLElement).querySelector(
      '[data-testid="activity-dynamics"]',
    );

    expect(chart?.textContent).toContain("Новые регистрации");
    expect(chart?.textContent).toContain("Отправленные решения");
    expect(chart?.querySelectorAll("circle").length).toBe(60);
    expect(chart?.querySelectorAll("polyline").length).toBe(2);
    expect(chart?.querySelector("title")?.textContent).toContain("01.08");
  });

  it("показывает отдельные zero states для каждого блока", () => {
    data.set({
      summary: {
        participants: { total: 0 },
        projects: { total: 0 },
        experts: { total: 0 },
        regions: { total: 0, items: [] },
      },
      participantFunnel: {
        registrations: 0,
        uniqueParticipants: 0,
        withTeam: 0,
        projectCreators: 0,
        submittedProjectCreators: 0,
      },
      solutionFunnel: { created: 0, notSubmitted: 0, submitted: 0, evaluated: 0 },
      evaluationStatus: {
        mode: "open",
        maxEvaluationsPerProject: null,
        assignments: { total: 0, pending: 0, evaluated: 0 },
        projects: {
          submitted: 0,
          awaitingEvaluation: 0,
          partiallyEvaluated: 0,
          evaluated: 0,
        },
      },
      attention: { participantsWithoutTeam: 0, projectsAwaitingEvaluation: 0 },
      activity: activity(30, true),
    });
    const fixture = TestBed.createComponent(ProgramAnalyticsComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain("У проектов пока не указаны регионы");
    expect(fixture.nativeElement.textContent).toContain("Пока нет данных по участникам");
    expect(fixture.nativeElement.textContent).toContain("Нет решений для отображения");
    expect(fixture.nativeElement.textContent).toContain("Пока нет сданных работ для оценивания");
    expect(fixture.nativeElement.textContent).toContain("Ничего не требует внимания");
    expect(fixture.nativeElement.querySelector(".attention__empty")).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain("За последние 30 дней активности не было");
    expect(fixture.nativeElement.querySelector(".activity__note")).toBeNull();
    expect(fixture.nativeElement.textContent).toContain("Статистика по кейсам пока недоступна");
    expect(fixture.nativeElement.querySelector(".analytics-card__empty--cases")).not.toBeNull();
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

  it("сохраняет существующие действия выгрузки", () => {
    const fixture = TestBed.createComponent(ProgramAnalyticsComponent);
    fixture.detectChanges();
    const buttons = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll(".exports__actions app-button"),
    );

    expect(buttons.length).toBe(3);
    expect(
      buttons.every(button => button.querySelector("button")?.classList.contains("button--big")),
    ).toBe(true);

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
