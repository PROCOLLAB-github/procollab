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
import { GetProgramManagerAssignmentsUseCase } from "@api/program/use-cases/get-program-manager-assignments.use-case";
import { GetProgramManagerAssignmentScoresUseCase } from "@api/program/use-cases/get-program-manager-assignment-scores.use-case";
import { GetProgramManagerParticipantsWithoutTeamUseCase } from "@api/program/use-cases/get-program-manager-participants-without-team.use-case";
import { GetProgramManagerProjectsAwaitingEvaluationUseCase } from "@api/program/use-cases/get-program-manager-projects-awaiting-evaluation.use-case";
import { GetProgramManagerProjectsNotSubmittedUseCase } from "@api/program/use-cases/get-program-manager-projects-not-submitted.use-case";
import { provideRouter } from "@angular/router";
import { of } from "rxjs";
import { ok } from "@domain/shared/result.type";
import { delayedExpert, scoreDetail } from "@domain/program/program-analytics-assignment.fixture";
import { AnalyticsDrilldownComponent } from "./drilldown/analytics-drilldown.component";

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
      submittedProjectCreators: 2,
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
    attention: {
      participantsWithoutTeam: 6,
      projectsAwaitingEvaluation: 2,
      projectsNotSubmitted: { applicable: false, total: 0 },
      delayedExperts: { total: 0, items: [] },
    },
    activity: activity(),
    cases: {
      configured: true,
      submissionApplicable: true,
      items: [
        { name: "Case A", participantsTotal: 7, projectsTotal: 3, notSubmitted: 1, submitted: 2 },
        { name: "Case B", participantsTotal: 4, projectsTotal: 1, notSubmitted: 0, submitted: 1 },
        { name: "Case C", participantsTotal: 0, projectsTotal: 0, notSubmitted: 0, submitted: 0 },
      ],
      withoutCase: { participantsTotal: 3, projectsTotal: 2, notSubmitted: 2, submitted: 0 },
    },
    ...overrides,
  };
}

describe("ProgramAnalyticsComponent", () => {
  const data = signal<ProgramAnalyticsOverview | null>(overview());
  const pending = signal(false);
  const failed = signal(false);
  const error = signal<any>(null);
  const analytics = {
    programId: signal<number | null>(12),
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

    TestBed.configureTestingModule({
      imports: [ProgramAnalyticsComponent],
      providers: [
        provideRouter([]),
        { provide: GetProgramManagerProjectsNotSubmittedUseCase, useValue: { execute: vi.fn() } },
        {
          provide: GetProgramManagerParticipantsWithoutTeamUseCase,
          useValue: { execute: vi.fn() },
        },
        {
          provide: GetProgramManagerProjectsAwaitingEvaluationUseCase,
          useValue: { execute: vi.fn() },
        },
        {
          provide: GetProgramManagerAssignmentsUseCase,
          useValue: { execute: vi.fn().mockReturnValue(of(ok([]))) },
        },
        {
          provide: GetProgramManagerAssignmentScoresUseCase,
          useValue: { execute: vi.fn().mockReturnValue(of(ok(scoreDetail()))) },
        },
      ],
    })
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

  describe("cases from manager overview", () => {
    function renderCases() {
      const fixture = TestBed.createComponent(ProgramAnalyticsComponent);
      fixture.detectChanges();
      const card = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(
        '[data-testid="cases-card"]',
      )!;
      return { fixture, card, rows: [...card.querySelectorAll<HTMLElement>(".case-row")] };
    }

    it("preserves backend counts/order/zero rows and appends withoutCase without mutations", () => {
      const before = JSON.stringify(data());
      const { fixture, card, rows } = renderCases();
      expect(rows.map(row => row.querySelector(".case-row__name")?.textContent)).toEqual([
        "Case A",
        "Case B",
        "Case C",
        "Без выбранного кейса",
      ]);
      expect(rows.map(row => row.querySelector(".case-row__total-value")?.textContent)).toEqual([
        "3",
        "1",
        "0",
        "2",
      ]);
      expect(rows.map(row => row.querySelector(".case-row__total-label")?.textContent)).toEqual([
        "проекта",
        "проект",
        "проектов",
        "проекта",
      ]);
      expect(rows[0].querySelector(".case-row__meta")?.textContent).toMatch(
        /Сдано 2\s*·\s*Не сдано 1\s*·\s*Участников 7/,
      );
      expect(rows[0].querySelector('[role="img"]')?.getAttribute("aria-label")).toBe(
        "Case A: 3 проекта, сдано 2, не сдано 1, участников 7",
      );
      expect(rows[3].classList.contains("case-row--without-case")).toBe(true);
      expect(card.querySelector("button, a")).toBeNull();
      expect(JSON.stringify(data())).toBe(before);
      expect(analytics.initialize).toHaveBeenCalledOnce();
      const tooltip = fixture.debugElement.query(By.css(".cases-card app-tooltip"))
        .componentInstance as TooltipComponent;
      expect(tooltip.text()).toBe(
        "Распределение проектов и участников по кейсам программы. Один участник может учитываться в нескольких кейсах.",
      );
    });

    it("normalizes bar widths by total projects, independently of submission share", () => {
      const { rows } = renderCases();
      const width = (index: number) =>
        parseFloat(rows[index].querySelector<HTMLElement>(".case-row__volume")!.style.width);
      expect(width(0)).toBe(100);
      expect(width(1)).toBeCloseTo(100 / 3);
      expect(width(2)).toBe(0);
      expect(width(3)).toBeCloseTo(200 / 3);
      expect(width(3)).toBeGreaterThan(width(1));
    });

    it("includes the visible without-case bucket in the common scale", () => {
      const model = overview();
      model.cases.withoutCase.projectsTotal = 6;
      data.set(model);
      const { rows } = renderCases();
      expect(rows[0].querySelector<HTMLElement>(".case-row__volume")!.style.width).toBe("50%");
      expect(rows[3].querySelector<HTMLElement>(".case-row__volume")!.style.width).toBe("100%");
    });

    it("hides an empty withoutCase bucket", () => {
      const model = overview();
      model.cases.withoutCase.projectsTotal = 0;
      data.set(model);
      const { card, rows } = renderCases();
      expect(rows).toHaveLength(3);
      expect(card.textContent).not.toContain("Без выбранного кейса");
    });

    it.each([
      [false, "Кейсы не настроены для этой программы"],
      [true, "Для программы пока не настроены варианты кейсов"],
    ])("renders controlled empty state when configured=%s", (configured, message) => {
      const model = overview();
      model.cases.configured = configured;
      if (configured) model.cases.items = [];
      data.set(model);
      const { card, rows } = renderCases();
      expect(rows).toHaveLength(0);
      expect(card.querySelector(".analytics-empty-state.text-body-10")?.textContent).toBe(message);
      expect(card.textContent).not.toContain("Без выбранного кейса");
    });

    it("keeps all configured zero options, without an empty state or fake bar values", () => {
      const model = overview();
      const zero = { participantsTotal: 0, projectsTotal: 0, notSubmitted: 0, submitted: 0 };
      model.cases.items = model.cases.items.map(item => ({ ...item, ...zero }));
      model.cases.withoutCase = zero;
      data.set(model);
      const { card, rows } = renderCases();
      expect(rows).toHaveLength(3);
      expect(card.querySelector(".analytics-empty-state")).toBeNull();
      expect(
        [...card.querySelectorAll<HTMLElement>(".case-row__bar span")].every(
          part => part.style.width === "0%",
        ),
      ).toBe(true);
    });

    it("hides only case submission split for noncompetitive programs, retaining raw metrics", () => {
      const model = overview();
      model.cases.submissionApplicable = false;
      data.set(model);
      const { fixture, card, rows } = renderCases();
      expect(rows).toHaveLength(4);
      expect(card.textContent).toContain("Case A");
      expect(card.textContent).toContain("Участников 7");
      expect(card.textContent).not.toMatch(/Сдано|Не сдано/);
      expect(rows[0].querySelector<HTMLElement>(".case-row__volume")!.style.width).toBe("100%");
      expect(rows[0].getAttribute("aria-label")).toBe("Case A: 3 проекта, участников 7");
      expect(model.cases.items[0].submitted).toBe(2);
      expect(
        fixture.nativeElement.querySelector('[data-testid="solution-funnel"]').textContent,
      ).toContain("Сдано");
    });

    it("retains full long names and all 20 rows inside the bounded, keyboard-scrollable list", () => {
      const model = overview();
      const longName =
        "Разработка цифрового ассистента для персонализированного образовательного маршрута";
      model.cases.items = Array.from({ length: 20 }, (_, index) => ({
        ...model.cases.items[0],
        name: `${longName} ${index + 1}`,
      }));
      model.cases.withoutCase.projectsTotal = 0;
      data.set(model);
      const { card, rows } = renderCases();
      expect(rows).toHaveLength(20);
      expect(rows[0].querySelector(".case-row__header > .case-row__name")?.textContent).toBe(
        `${longName} 1`,
      );
      expect(
        rows[0].querySelector(".case-row__header > .case-row__total .case-row__total-value"),
      ).not.toBeNull();
      expect(card.querySelector(".cases-card__title")?.textContent).toBe("Кейсы");
      expect(card.querySelector(".cases-card__list")?.getAttribute("tabindex")).toBe("0");
      expect(card.querySelector(".cases-card__list")?.getAttribute("aria-labelledby")).toBe(
        card.querySelector("h2")?.id,
      );
    });
  });

  it("показывает authoritative summary и реальный разрез регионов", () => {
    const fixture = TestBed.createComponent(ProgramAnalyticsComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(analytics.initialize).toHaveBeenCalledOnce();
    expect(root.textContent).toContain(
      "Сводка пути участников от регистрации до экспертной оценки.",
    );
    expect(root.textContent?.toLowerCase()).not.toContain("обезличенная");
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

  it.each([
    [0, "all"],
    [1, "completed"],
    [2, "pending"],
  ] as const)("метрика %s открывает scope %s с конкретной кнопки", (index, scope) => {
    const fixture = TestBed.createComponent(ProgramAnalyticsComponent);
    fixture.detectChanges();
    const drilldown = fixture.debugElement.query(By.directive(AnalyticsDrilldownComponent))
      .componentInstance as AnalyticsDrilldownComponent;
    const open = vi.spyOn(drilldown, "openAssignments").mockImplementation(() => {});
    const trigger = fixture.nativeElement.querySelectorAll(".evaluation__assignment-action")[
      index
    ] as HTMLButtonElement;
    trigger.click();
    expect(open).toHaveBeenCalledExactlyOnceWith(scope, trigger);
  });

  it("не скрывает назначения несданных проектов, но отключает нулевые метрики", () => {
    const base = overview();
    data.set({
      ...base,
      evaluationStatus: {
        ...base.evaluationStatus,
        assignments: { total: 2, pending: 2, evaluated: 0 },
        projects: { submitted: 0, awaitingEvaluation: 0, partiallyEvaluated: 0, evaluated: 0 },
      },
    });
    const fixture = TestBed.createComponent(ProgramAnalyticsComponent);
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll(
      ".evaluation__assignment-action",
    ) as NodeListOf<HTMLButtonElement>;
    expect(buttons).toHaveLength(3);
    expect(buttons[0].disabled).toBe(false);
    expect(buttons[1].disabled).toBe(true);
    expect(buttons[2].disabled).toBe(false);
  });

  it("delayed count использует overview и открывает список с конкретного trigger", () => {
    const base = overview();
    data.set({
      ...base,
      attention: {
        participantsWithoutTeam: 0,
        projectsAwaitingEvaluation: 0,
        projectsNotSubmitted: { applicable: false, total: 0 },
        delayedExperts: { total: 1, items: [delayedExpert()] },
      },
    });
    const fixture = TestBed.createComponent(ProgramAnalyticsComponent);
    fixture.detectChanges();
    const drilldown = fixture.debugElement.query(By.directive(AnalyticsDrilldownComponent))
      .componentInstance as AnalyticsDrilldownComponent;
    const open = vi.spyOn(drilldown, "openDelayed").mockImplementation(() => {});
    const trigger = Array.from(
      fixture.nativeElement.querySelectorAll(".attention__action") as NodeListOf<HTMLButtonElement>,
    ).find(button => button.textContent?.includes("Эксперты задерживают"))!;
    expect(trigger.textContent).toContain("Эксперты задерживают оценивание");
    expect(trigger.textContent).toContain("1");
    trigger.click();
    expect(open).toHaveBeenCalledExactlyOnceWith(trigger);
    expect(drilldown.delayedExperts().items).toEqual([delayedExpert()]);
    expect(fixture.nativeElement.querySelector(".attention--empty")).toBeNull();
  });

  it.each([
    ["Участники без команды", "participants-without-team", "participantsWithoutTeam"],
    ["Работы ожидают оценивания", "projects-awaiting-evaluation", "projectsAwaitingEvaluation"],
  ] as const)("%s: button, zero disabled, tooltip отдельно", (label, view, key) => {
    const fixture = TestBed.createComponent(ProgramAnalyticsComponent);
    fixture.detectChanges();
    const drilldown = fixture.debugElement.query(By.directive(AnalyticsDrilldownComponent))
      .componentInstance as AnalyticsDrilldownComponent;
    const open = vi.spyOn(drilldown, "openAttention").mockImplementation(() => {});
    const trigger = Array.from(
      fixture.nativeElement.querySelectorAll(".attention__action") as NodeListOf<HTMLButtonElement>,
    ).find(button => button.textContent?.includes(label))!;
    expect(trigger.disabled).toBe(false);
    expect(trigger.querySelector("app-tooltip")).toBeNull();
    trigger.parentElement!.querySelector<HTMLElement>("app-tooltip")!.click();
    expect(open).not.toHaveBeenCalled();
    trigger.click();
    expect(open).toHaveBeenCalledExactlyOnceWith(view, trigger);
    const current = data()!;
    data.set({ ...current, attention: { ...current.attention, [key]: 0 } });
    fixture.detectChanges();
    expect(trigger.disabled).toBe(true);
    trigger.click();
    expect(open).toHaveBeenCalledTimes(1);
  });

  it("not-submitted: порядок, активная/нулевая строка и tooltip отдельно", () => {
    const base = overview();
    data.set({
      ...base,
      attention: { ...base.attention, projectsNotSubmitted: { applicable: true, total: 4 } },
    });
    const fixture = TestBed.createComponent(ProgramAnalyticsComponent);
    fixture.detectChanges();
    const drilldown = fixture.debugElement.query(By.directive(AnalyticsDrilldownComponent))
      .componentInstance as AnalyticsDrilldownComponent;
    const open = vi.spyOn(drilldown, "openAttention").mockImplementation(() => {});
    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll(".attention__action"),
    ) as HTMLButtonElement[];
    expect(buttons.map(button => button.querySelector("span")?.textContent)).toEqual([
      "Участники без команды",
      "Работы ожидают оценивания",
      "Проекты не сдали решение",
      "Эксперты задерживают оценивание",
    ]);
    const trigger = buttons[2];
    expect(trigger.disabled).toBe(false);
    expect(drilldown.notSubmittedApplicable()).toBe(true);
    expect(trigger.querySelector("app-tooltip")).toBeNull();
    trigger.parentElement!.querySelector<HTMLElement>("app-tooltip")!.click();
    expect(open).not.toHaveBeenCalled();
    trigger.click();
    expect(open).toHaveBeenCalledExactlyOnceWith("projects-not-submitted", trigger);
    data.set({
      ...base,
      attention: {
        participantsWithoutTeam: 0,
        projectsAwaitingEvaluation: 0,
        delayedExperts: { total: 0, items: [] },
        projectsNotSubmitted: { applicable: true, total: 0 },
      },
    });
    fixture.detectChanges();
    expect(trigger.disabled).toBe(true);
    expect(fixture.nativeElement.textContent).toContain("Ничего не требует внимания");
    trigger.click();
    expect(open).toHaveBeenCalledTimes(1);
  });

  it("non-competitive скрывает строку даже с notSubmitted > 0 и не делает detail request", () => {
    const fixture = TestBed.createComponent(ProgramAnalyticsComponent);
    fixture.detectChanges();
    const drilldown = fixture.debugElement.query(By.directive(AnalyticsDrilldownComponent))
      .componentInstance as AnalyticsDrilldownComponent;
    expect(data()?.solutionFunnel.notSubmitted).toBeGreaterThan(0);
    expect(fixture.nativeElement.textContent).not.toContain("Проекты не сдали решение");
    drilldown.openAttention("projects-not-submitted", document.createElement("button"));
    expect(
      TestBed.inject(GetProgramManagerProjectsNotSubmittedUseCase).execute,
    ).not.toHaveBeenCalled();
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
    const model = overview();
    model.participantFunnel = {
      ...model.participantFunnel,
      registrations: 11,
      uniqueParticipants: 7,
      withTeam: 4,
      projectCreators: 3,
    };
    data.set(model);
    const fixture = TestBed.createComponent(ProgramAnalyticsComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const participants = root.querySelector('[data-testid="participant-funnel"]')?.textContent;
    const solutions = root.querySelector('[data-testid="solution-funnel"]')?.textContent;

    expect(participants).toContain("Зарегистрировались");
    expect(participants).not.toContain("Уникальные участники");
    const rows = Array.from(root.querySelectorAll('[data-testid="participant-funnel"] li'));
    expect(rows.map(row => row.querySelector(".funnel__label")?.textContent?.trim())).toEqual([
      "Зарегистрировались",
      "В команде",
      "Создали проект",
    ]);
    expect(rows.map(row => row.querySelector("strong")?.textContent?.trim())).toEqual([
      "7",
      "4",
      "3",
    ]);
    expect(data()?.participantFunnel.registrations).toBe(11);
    const tooltips = fixture.debugElement
      .queryAll(By.directive(TooltipComponent))
      .map(element => (element.componentInstance as TooltipComponent).text());
    expect(tooltips).toContain("Уникальные зарегистрированные участники программы.");
    expect(tooltips).toContain("Путь участников от регистрации до создания проекта.");
    expect(tooltips.some(text => text.includes("регистрационные записи"))).toBe(false);
    expect(root.querySelector('[data-testid="attention-block"]')?.textContent).toContain(
      "Участники без команды",
    );
    expect(participants).toContain("В команде");
    expect(participants).toContain("Создали проект");
    expect(participants).not.toContain("Сдали проект");
    const submitted = Array.from(root.querySelectorAll('[data-testid="solution-funnel"] li')).find(
      row => row.querySelector(".funnel__label")?.textContent?.trim().startsWith("Сдано"),
    );
    expect(submitted?.querySelector("strong")?.textContent?.trim()).toBe("6");
    expect(solutions).toContain("Создано");
    expect(solutions).toContain("Черновик / не сдано");
    expect(solutions).toContain("Сдано");
    expect(solutions).toContain("Оценено");
    expect(root.querySelector('[data-testid="solution-funnel"] h2')?.textContent?.trim()).toBe(
      "Воронка проектов",
    );
    expect(solutions).not.toContain("Воронка решений");
  });

  it("technical registrations alone do not remove the participant zero state", () => {
    const model = overview();
    model.participantFunnel = {
      registrations: 11,
      uniqueParticipants: 0,
      withTeam: 0,
      projectCreators: 0,
      submittedProjectCreators: 0,
    };
    data.set(model);
    const fixture = TestBed.createComponent(ProgramAnalyticsComponent);
    fixture.detectChanges();
    const card = (fixture.nativeElement as HTMLElement).querySelector(
      '[data-testid="participant-funnel"]',
    );
    expect(card?.querySelectorAll("li")).toHaveLength(0);
    expect(card?.textContent).toContain("Пока нет данных по участникам");
  });

  it("uses text-body-10 for metric labels without changing heading or number classes", () => {
    const model = overview();
    model.evaluationStatus.mode = "distributed";
    model.attention.projectsNotSubmitted = { applicable: true, total: 2 };
    data.set(model);
    const fixture = TestBed.createComponent(ProgramAnalyticsComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const selectors = [
      ".status-list--projects li > span",
      ".evaluation__assignment-action > span",
      ".attention__action > span",
      ".evaluation__limit .text-body-10",
    ];
    expect(selectors.map(selector => root.querySelectorAll(selector).length)).toEqual([4, 3, 4, 1]);
    for (const selector of selectors) {
      for (const label of root.querySelectorAll(selector))
        expect(label.classList.contains("text-body-10")).toBe(true);
    }
    expect(
      root.querySelectorAll(
        ".status-list strong.text-body-10, .attention strong.text-body-10, h2.text-body-10:not(.summary-card__label), h3.text-body-10",
      ),
    ).toHaveLength(0);
    expect(root.querySelector(".evaluation__limit strong")?.textContent).toBe("3");
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
    expect(evaluation?.querySelectorAll('[data-testid="assignment-statuses"] button')).toHaveLength(
      3,
    );
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
    const partialTooltip = fixture.debugElement
      .queryAll(By.directive(TooltipComponent))
      .map(element => element.componentInstance as TooltipComponent)
      .find(tooltip => tooltip.text().startsWith("Хотя бы один"));
    expect(partialTooltip?.text()).toBe(
      "Хотя бы один назначенный эксперт полностью оценил проект, но не все назначенные эксперты завершили оценивание.",
    );
    expect(evaluation?.querySelector('[data-testid="assignment-statuses"]')?.textContent).toContain(
      "Назначений всего",
    );
  });

  it("использует attention backend напрямую, без frontend approximation", () => {
    const base = overview();
    data.set({
      ...base,
      summary: { ...base.summary, participants: { total: 100 } },
      attention: {
        participantsWithoutTeam: 3,
        projectsAwaitingEvaluation: 1,
        projectsNotSubmitted: { applicable: false, total: 0 },
        delayedExperts: { total: 0, items: [] },
      },
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
    expect(attention?.querySelectorAll(".attention__list li").length).toBe(3);
    expect(attention?.querySelectorAll(".attention__list li strong").length).toBe(3);
  });

  it("keeps drilldown arrows separate from wrapping labels and preserves zero-state disabling", () => {
    const fixture = TestBed.createComponent(ProgramAnalyticsComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    for (const button of root.querySelectorAll<HTMLButtonElement>(
      ".evaluation__assignment-action, .attention__action",
    )) {
      expect(button.type).toBe("button");
      const arrow = button.querySelector<HTMLElement>(
        ".evaluation__assignment-arrow, .attention__arrow",
      )!;
      expect(arrow.parentElement).toBe(button);
      expect(arrow.getAttribute("aria-hidden")).toBe("true");
      expect(arrow.querySelector("use")?.getAttribute("xlink:href")).toContain("arrowright");
      const count = Number(button.querySelector("strong")!.textContent);
      expect(button.disabled).toBe(count === 0);
    }
  });

  it("marks zero attention rows and keeps tooltip controls separate and keyboard accessible", () => {
    const fixture = TestBed.createComponent(ProgramAnalyticsComponent);
    fixture.detectChanges();
    const drilldown = fixture.debugElement.query(By.directive(AnalyticsDrilldownComponent))
      .componentInstance as AnalyticsDrilldownComponent;
    const open = vi.spyOn(drilldown, "openAttention").mockImplementation(() => {});
    const delayed = vi.spyOn(drilldown, "openDelayed").mockImplementation(() => {});
    const rows = fixture.nativeElement.querySelectorAll(
      ".attention__list li",
    ) as NodeListOf<HTMLElement>;
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      const action = row.querySelector<HTMLButtonElement>(".attention__action")!;
      const tooltip = row.querySelector<HTMLElement>("app-tooltip")!;
      expect(action.parentElement).toBe(row);
      expect(tooltip.parentElement).toBe(row);
      expect(action.querySelector("app-tooltip")).toBeNull();
      expect(row.classList.contains("attention__row--disabled")).toBe(action.disabled);
      expect(tooltip.tabIndex).toBe(0);
      expect(tooltip.getAttribute("role")).toBe("button");
      tooltip.click();
      fixture.detectChanges();
      expect(tooltip.getAttribute("aria-expanded")).toBe("true");
      tooltip.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      fixture.detectChanges();
      expect(tooltip.getAttribute("aria-expanded")).toBe("false");
      tooltip.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
      fixture.detectChanges();
      expect(tooltip.getAttribute("aria-expanded")).toBe("true");
      if (action.disabled) action.click();
    }
    expect(open).not.toHaveBeenCalled();
    expect(delayed).not.toHaveBeenCalled();
    rows[0].querySelector<HTMLButtonElement>(".attention__action")!.click();
    expect(open).toHaveBeenCalledOnce();
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
      attention: {
        participantsWithoutTeam: 0,
        projectsAwaitingEvaluation: 0,
        projectsNotSubmitted: { applicable: false, total: 0 },
        delayedExperts: { total: 0, items: [] },
      },
      activity: activity(30, true),
      cases: {
        configured: false,
        submissionApplicable: false,
        items: [],
        withoutCase: { participantsTotal: 0, projectsTotal: 0, notSubmitted: 0, submitted: 0 },
      },
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
    expect(fixture.nativeElement.textContent).toContain("Кейсы не настроены для этой программы");
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
