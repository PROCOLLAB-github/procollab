/** @format */

import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { TooltipComponent } from "@ui/primitives/tooltip/tooltip.component";
import { ExportFileInfoService } from "@api/export-file/facades/export-file-info.service";
import { ProgramAnalyticsInfoService } from "@api/program/facades/detail/program-analytics-info.service";
import { ProgramAnalyticsOverview } from "@domain/program/program-analytics.model";
import { initial } from "@domain/shared/async-state";
import { ProgramAnalyticsComponent } from "./analytics.component";
import { exportRegions } from "@utils/export-regions";

vi.mock("@utils/export-regions", () => ({ exportRegions: vi.fn().mockResolvedValue(undefined) }));

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
      participantRegions: {
        total: 2,
        items: [
          { name: "Москва", count: 12 },
          { name: "Набережные Челны", count: 2 },
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
    vi.mocked(exportRegions).mockReset().mockResolvedValue(undefined);
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
    expect(
      root.querySelector('[data-testid="summary-participants-per-project"]')?.textContent,
    ).toContain("Команда");
    expect(root.textContent).not.toContain("Участников на проект");
    expect(
      root.querySelector('[data-testid="summary-participants-per-project"]')?.textContent,
    ).toContain("2.6");
    expect(root.querySelector('[data-testid="summary-team"]')).toBeNull();
    expect(root.querySelector('[data-testid="summary-regions"]')).toBeNull();
    expect(root.querySelector('[data-testid="project-regions"]')?.textContent).toContain("Москва");
    expect(root.querySelector('[data-testid="project-regions"]')?.textContent).toContain("Казань");
    expect(root.querySelectorAll('[data-testid="metric-tooltip"]').length).toBe(4);
    const tooltip = fixture.debugElement.query(
      By.css('[data-testid="summary-participants-per-project"] app-tooltip'),
    ).componentInstance as TooltipComponent;
    expect(tooltip.text()).toBe(
      "Среднее количество зарегистрированных участников программы на один проект.",
    );
  });

  it("renders independent project and participant region cards without normalizing legacy names", () => {
    const fixture = TestBed.createComponent(ProgramAnalyticsComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const cards = root.querySelectorAll(".regions-grid > .regions");
    expect(cards).toHaveLength(2);
    expect(cards[0].querySelector("h2")?.textContent).toBe("Регионы проектов");
    expect(cards[1].querySelector("h2")?.textContent).toBe("Регионы участников");
    const rows = (card: Element) =>
      Array.from(card.querySelectorAll("li"), row => [
        row.querySelector("span")?.textContent?.trim(),
        row.querySelector("strong")?.textContent?.trim(),
      ]);
    expect(rows(cards[0])).toEqual([
      ["Москва", "5"],
      ["Казань", "2"],
    ]);
    expect(rows(cards[1])).toEqual([
      ["Москва", "12"],
      ["Набережные Челны", "2"],
    ]);
  });

  it.each(["regions", "participantRegions"] as const)(
    "shows an independent empty state for %s",
    key => {
      const base = overview();
      data.set({ ...base, summary: { ...base.summary, [key]: { total: 0, items: [] } } });
      const fixture = TestBed.createComponent(ProgramAnalyticsComponent);
      fixture.detectChanges();
      const root = fixture.nativeElement as HTMLElement;
      expect(root.querySelectorAll(".regions .analytics-empty-state")).toHaveLength(1);
      expect(root.querySelectorAll(".regions__list")).toHaveLength(1);
      expect(root.querySelector(".regions .analytics-empty-state")?.textContent?.trim()).toBe(
        key === "regions"
          ? "У проектов пока не указаны регионы"
          : "У участников пока не указаны регионы",
      );
    },
  );

  it("считает и форматирует отношение участников программы к проектам", () => {
    const base = overview();
    const fixture = TestBed.createComponent(ProgramAnalyticsComponent);

    data.set({
      ...base,
      summary: {
        ...base.summary,
        participants: { total: 21 },
        projects: { total: 6 },
      },
    });
    fixture.detectChanges();
    const participantsPerProjectValue = () =>
      (fixture.nativeElement as HTMLElement)
        .querySelector('[data-testid="summary-participants-per-project"] .summary-card__value')
        ?.textContent?.trim();
    expect(participantsPerProjectValue()).toBe("3.5");

    data.set({
      ...base,
      summary: {
        ...base.summary,
        participants: { total: 18 },
        projects: { total: 6 },
      },
    });
    fixture.detectChanges();
    expect(participantsPerProjectValue()).toBe("3");

    data.set({
      ...base,
      summary: {
        ...base.summary,
        participants: { total: 18 },
        projects: { total: 0 },
      },
    });
    fixture.detectChanges();
    expect(participantsPerProjectValue()).toBe("0");
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
    expect(root.querySelector('[data-testid="solution-funnel"] h2')?.textContent?.trim()).toBe(
      "Воронка проектов",
    );
    expect(solutions).not.toContain("Воронка решений");
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
    expect(chart?.querySelectorAll(".activity__grid-line")).toHaveLength(5);
    expect(chart?.querySelector(".activity__y-axis")?.textContent).toContain("4");
    expect(chart?.textContent).toContain("Количество событий в день");
    const date = chart?.querySelectorAll<HTMLButtonElement>(".activity__date-target")[1];
    expect(date?.getAttribute("aria-label")).toContain(
      "02.08: новые регистрации — 1, отправленные решения — 1",
    );
    date?.dispatchEvent(new FocusEvent("focus"));
    fixture.detectChanges();
    expect(chart?.querySelector(".activity__readout")?.textContent).toContain("02.08");
    date?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    fixture.detectChanges();
    expect(chart?.querySelector(".activity__readout")?.textContent).toContain("Наведите указатель");
  });

  it("exports each loaded region dataset independently and prevents repeated clicks", async () => {
    let resolve!: () => void;
    vi.mocked(exportRegions).mockReturnValueOnce(
      new Promise<void>(done => {
        resolve = done;
      }),
    );
    const fixture = TestBed.createComponent(ProgramAnalyticsComponent);
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll(
      ".regions__export",
    ) as NodeListOf<HTMLButtonElement>;
    expect(buttons).toHaveLength(2);
    expect(exportRegions).not.toHaveBeenCalled();
    buttons[0].click();
    buttons[0].click();
    fixture.detectChanges();
    expect(buttons[0].disabled).toBe(true);
    expect(buttons[1].disabled).toBe(false);
    expect(exportRegions).toHaveBeenCalledExactlyOnceWith(
      "project-regions",
      data()!.summary.regions.items,
    );
    buttons[1].click();
    expect(exportRegions).toHaveBeenLastCalledWith(
      "participant-regions",
      data()!.summary.participantRegions.items,
    );
    resolve();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(buttons[0].disabled).toBe(false);
  });

  it("disables empty region exports and keeps export errors local to their card", async () => {
    const empty = overview();
    empty.summary.regions = { total: 0, items: [] };
    data.set(empty);
    vi.mocked(exportRegions).mockRejectedValueOnce(new Error("internal details"));
    const fixture = TestBed.createComponent(ProgramAnalyticsComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const buttons = root.querySelectorAll<HTMLButtonElement>(".regions__export");
    expect(buttons[0].disabled).toBe(true);
    expect(buttons[0].title).toBe("Нет данных для выгрузки");
    buttons[0].click();
    expect(exportRegions).not.toHaveBeenCalled();
    buttons[1].click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(
      root.querySelector('[data-testid="participant-regions"] [role="alert"]')?.textContent,
    ).toContain("Не удалось создать Excel");
    expect(root.textContent).not.toContain("internal details");
    expect(root.querySelector(".activity")).not.toBeNull();
    buttons[1].click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(root.querySelector('[data-testid="participant-regions"] [role="alert"]')).toBeNull();
  });

  it("показывает отдельные zero states для каждого блока", () => {
    data.set({
      summary: {
        participants: { total: 0 },
        projects: { total: 0 },
        experts: { total: 0 },
        regions: { total: 0, items: [] },
        participantRegions: { total: 0, items: [] },
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
    expect(fixture.nativeElement.textContent).toContain("У участников пока не указаны регионы");
    expect(fixture.nativeElement.textContent).toContain("Пока нет данных по участникам");
    expect(fixture.nativeElement.textContent).toContain("Нет решений для отображения");
    expect(fixture.nativeElement.textContent).toContain("Пока нет сданных работ для оценивания");
    expect(fixture.nativeElement.textContent).toContain("Ничего не требует внимания");
    const emptyStates = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll(".analytics-empty-state"),
    ) as HTMLElement[];
    expect(emptyStates).toHaveLength(8);
    expect(emptyStates.every(state => state.querySelector("i") === null)).toBe(true);
    expect(emptyStates.every(state => !state.textContent?.trim().endsWith("."))).toBe(true);
    expect(fixture.nativeElement.querySelector(".attention--empty")).not.toBeNull();
    expect(fixture.nativeElement.querySelector(".attention__empty")).not.toBeNull();
    expect(
      fixture.nativeElement.querySelector(".attention > .analytics-empty-state"),
    ).not.toBeNull();
    expect(fixture.nativeElement.querySelector(".regions > .analytics-empty-state")).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain("За последние 30 дней активности не было");
    expect(fixture.nativeElement.querySelector(".activity__note")).toBeNull();
    expect(fixture.nativeElement.textContent).toContain("Статистика по кейсам пока недоступна");
    expect(
      fixture.nativeElement.querySelector('[data-testid="cases-card"] .analytics-empty-state i'),
    ).toBeNull();
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
