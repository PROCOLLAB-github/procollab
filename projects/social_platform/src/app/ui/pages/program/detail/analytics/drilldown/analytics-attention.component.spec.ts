/** @format */
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { provideRouter, Router } from "@angular/router";
import { CdkTrapFocus } from "@angular/cdk/a11y";
import { firstValueFrom, of, Subject } from "rxjs";
import { GetProgramManagerAssignmentsUseCase } from "@api/program/use-cases/get-program-manager-assignments.use-case";
import { GetProgramManagerAssignmentScoresUseCase } from "@api/program/use-cases/get-program-manager-assignment-scores.use-case";
import { GetProgramManagerParticipantsWithoutTeamUseCase } from "@api/program/use-cases/get-program-manager-participants-without-team.use-case";
import { GetProgramManagerProjectsAwaitingEvaluationUseCase } from "@api/program/use-cases/get-program-manager-projects-awaiting-evaluation.use-case";
import {
  ProgramAnalyticsDrilldownService,
  AnalyticsAttentionView,
} from "@api/program/facades/detail/program-analytics-drilldown.service";
import {
  attentionParticipant,
  attentionProject,
  participantsPage,
  projectsPage,
} from "@domain/program/program-analytics-attention.fixture";
import { fail, ok } from "@domain/shared/result.type";
import { AvatarComponent } from "@ui/primitives/avatar/avatar.component";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { AnalyticsDrilldownComponent } from "./analytics-drilldown.component";

describe("Attention views: real overlay", () => {
  let fixture: ComponentFixture<AnalyticsDrilldownComponent>;
  let state: ProgramAnalyticsDrilldownService;
  let modal: ModalComponent;
  let trigger: HTMLButtonElement;
  const participants = { execute: vi.fn() };
  const projects = { execute: vi.fn() };
  const dialog = () => document.querySelector<HTMLElement>('[role="dialog"]')!;
  const button = (text: string) =>
    Array.from(dialog().querySelectorAll<HTMLButtonElement>("button")).find(
      item => item.textContent?.trim() === text,
    )!;

  beforeEach(async () => {
    participants.execute.mockReset().mockReturnValue(of(ok(participantsPage())));
    projects.execute.mockReset().mockReturnValue(of(ok(projectsPage())));
    await TestBed.configureTestingModule({
      imports: [AnalyticsDrilldownComponent],
      providers: [
        provideRouter([]),
        { provide: GetProgramManagerParticipantsWithoutTeamUseCase, useValue: participants },
        { provide: GetProgramManagerProjectsAwaitingEvaluationUseCase, useValue: projects },
        {
          provide: GetProgramManagerAssignmentsUseCase,
          useValue: { execute: vi.fn().mockReturnValue(of(ok([]))) },
        },
        { provide: GetProgramManagerAssignmentScoresUseCase, useValue: { execute: vi.fn() } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(AnalyticsDrilldownComponent);
    fixture.componentRef.setInput("programId", 12);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    state = fixture.debugElement.injector.get(ProgramAnalyticsDrilldownService);
    modal = fixture.debugElement.query(By.directive(ModalComponent)).componentInstance;
    trigger = document.createElement("button");
    document.body.append(trigger);
    trigger.focus();
  });
  afterEach(() => {
    fixture.destroy();
    trigger.remove();
  });

  async function open(view: AnalyticsAttentionView = "participants-without-team"): Promise<void> {
    const attached = firstValueFrom(modal.overlayRef!.attachments());
    fixture.componentInstance.openAttention(view, trigger);
    expect(document.activeElement).toBe(trigger);
    await attached;
    await fixture.whenStable();
  }

  it("participants: реальные поля, local date, legacy city, fallback, актуальный count", async () => {
    participants.execute.mockReturnValue(
      of(
        ok(
          participantsPage({
            count: 2,
            results: [
              attentionParticipant(),
              attentionParticipant({
                userId: 124,
                fullName: "Участник №124",
                city: null,
                registeredAt: null,
              }),
            ],
          }),
        ),
      ),
    );
    await open();
    for (const text of [
      "Участники без команды",
      "Анна Петрова",
      "Набережные Челны",
      "01.09.2026",
      "Не указано",
      "Нет данных",
      "Найдено: 2",
    ])
      expect(dialog().textContent).toContain(text);
    expect(
      fixture.debugElement
        .queryAll(By.directive(AvatarComponent))
        .every(item => item.componentInstance.url() === ""),
    ).toBe(true);
    expect(dialog().querySelector("a")?.getAttribute("href")).toBe("/office/profile/123");
    expect(dialog().textContent).not.toMatch(/Ищет команду|Вуз|email|Напомнить/);
  });

  it("server search только submit, clear, count и pagination из detail", async () => {
    participants.execute.mockReturnValue(
      of(
        ok(
          participantsPage({
            count: 61,
            results: Array.from({ length: 25 }, (_, i) => attentionParticipant({ userId: i + 1 })),
          }),
        ),
      ),
    );
    await open();
    expect(dialog().textContent).toContain("1–25 из 61");
    button("Далее").click();
    await fixture.whenStable();
    expect(participants.execute).toHaveBeenLastCalledWith(12, {
      search: "",
      limit: 25,
      offset: 25,
    });
    expect(dialog().textContent).toContain("26–50 из 61");
    const input = dialog().querySelector("input")!;
    input.value = " Анна ";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await fixture.whenStable();
    expect(participants.execute).toHaveBeenCalledTimes(2);
    dialog()
      .querySelector("form")!
      .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    await fixture.whenStable();
    expect(participants.execute).toHaveBeenLastCalledWith(12, {
      search: "Анна",
      limit: 25,
      offset: 0,
    });
    button("Очистить").click();
    await fixture.whenStable();
    expect(input.value).toBe("");
    expect(participants.execute).toHaveBeenLastCalledWith(12, { search: "", limit: 25, offset: 0 });
  });

  it("distributed: одна работа на строку, причины, прогресс, nullable leader/date", async () => {
    projects.execute.mockReturnValue(
      of(
        ok(
          projectsPage({
            count: 3,
            results: [
              attentionProject(),
              attentionProject({
                programProjectId: 71,
                leader: null,
                submittedAt: null,
                reason: "no_assignments",
                reasonLabel: "Эксперты не назначены",
                assignmentsTotal: 0,
                assignmentsCompleted: 0,
              }),
              attentionProject({
                programProjectId: 72,
                status: "awaiting_evaluation",
                reason: "no_completed_evaluations",
                reasonLabel: "Нет завершённых оценок",
                assignmentsCompleted: 0,
              }),
            ],
          }),
        ),
      ),
    );
    await open("projects-awaiting-evaluation");
    for (const text of [
      "Работы ожидают оценивания",
      "03.09.2026",
      "Частично оценено",
      "Завершили: 1 из 3",
      "Не указан",
      "Дата сдачи неизвестна",
      "Нет назначений",
      "Нет завершённых оценок",
    ])
      expect(dialog().textContent).toContain(text);
    expect(dialog().querySelectorAll("tbody tr")).toHaveLength(3);
    expect(dialog().querySelector('[data-reason="no_assignments"]')).not.toBeNull();
    expect(dialog().querySelector("a")?.getAttribute("href")).toBe("/office/projects/55");
    expect(dialog().textContent).not.toContain("Ещё не сданы");
  });

  it("open: nullable progress —, не 0 из 0", async () => {
    projects.execute.mockReturnValue(
      of(
        ok(
          projectsPage({
            mode: "open",
            results: [
              attentionProject({
                reason: "awaiting_first_evaluation",
                reasonLabel: "Ожидает первой оценки",
                assignmentsTotal: null,
                assignmentsCompleted: null,
              }),
            ],
          }),
        ),
      ),
    );
    await open("projects-awaiting-evaluation");
    expect(dialog().querySelector('[data-label="Прогресс"]')?.textContent?.trim()).toBe("—");
    expect(dialog().textContent).toContain("Ожидает первой оценки");
  });

  it.each(["participants-without-team", "projects-awaiting-evaluation"] as const)(
    "%s: loading, empty, search_empty, error и retry отдельно",
    async view => {
      const api = view === "participants-without-team" ? participants : projects;
      const page = view === "participants-without-team" ? participantsPage() : projectsPage();
      const loading = new Subject();
      api.execute.mockReturnValueOnce(loading);
      await open(view);
      expect(dialog().textContent).toContain("Загружаем список");
      loading.next(ok({ ...page, count: 0, results: [] }));
      await fixture.whenStable();
      expect(dialog().textContent).toContain(
        view === "participants-without-team"
          ? "Все зарегистрированные участники уже состоят в командах."
          : "Нет работ, ожидающих оценивания.",
      );
      api.execute.mockReturnValueOnce(of(ok({ ...page, count: 0, results: [] })));
      state.searchDraft.set("нет");
      state.applyAttentionSearch();
      await fixture.whenStable();
      expect(dialog().textContent).toContain("По вашему запросу ничего не найдено.");
      for (const [kind, message] of [
        ["unauthorized", "Авторизуйтесь заново"],
        ["forbidden", "Нет доступа к данным этой программы."],
        ["not_found", "Программа не найдена."],
        ["network", "Проверьте соединение"],
      ] as const) {
        api.execute.mockReturnValueOnce(of(fail({ kind, body: "secret" })));
        state.loadAttention();
        await fixture.whenStable();
        expect(dialog().querySelector('[role="alert"]')?.textContent).toContain(message);
        expect(dialog().textContent).not.toContain("secret");
        expect(dialog().textContent).not.toContain("По вашему запросу ничего не найдено.");
        button("Повторить загрузку").click();
        await fixture.whenStable();
        expect(dialog().querySelector('[role="alert"]')).toBeNull();
      }
    },
  );

  it.each(["participants-without-team", "projects-awaiting-evaluation"] as const)(
    "%s: один trap, focus, Escape/backdrop/button единый close",
    async view => {
      let trap: CdkTrapFocus | undefined;
      for (const method of ["Escape", "backdrop", "button"]) {
        await open(view);
        const currentTrap = fixture.debugElement
          .query(By.directive(CdkTrapFocus))
          .injector.get(CdkTrapFocus);
        trap ??= currentTrap;
        expect(currentTrap).toBe(trap);
        expect(document.activeElement).toBe(dialog().querySelector(".analytics-drilldown__close"));
        expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(1);
        expect(trap.enabled).toBe(true);
        expect(dialog().querySelectorAll('.cdk-focus-trap-anchor[tabindex="0"]')).toHaveLength(2);
        const close = vi.spyOn(fixture.componentInstance, "closeAnalyticsModal");
        const detached = firstValueFrom(modal.overlayRef!.detachments());
        if (method === "Escape")
          (modal.overlayRef!.keydownEvents() as Subject<KeyboardEvent>).next(
            new KeyboardEvent("keydown", { key: "Escape" }),
          );
        else if (method === "backdrop")
          document.querySelector<HTMLElement>(".modal__overlay")!.click();
        else button("×").click();
        await detached;
        await fixture.whenStable();
        expect(close).toHaveBeenCalledOnce();
        close.mockRestore();
        expect(document.activeElement).toBe(trigger);
        expect(state.attentionPage()).toBeNull();
      }
    },
  );

  it("RouterLink закрывает без return focus в покидаемую программу", async () => {
    const navigate = vi.spyOn(TestBed.inject(Router), "navigateByUrl").mockResolvedValue(true);
    await open();
    const focus = vi.spyOn(trigger, "focus");
    const detached = firstValueFrom(modal.overlayRef!.detachments());
    dialog().querySelector<HTMLAnchorElement>("a")!.click();
    await detached;
    await fixture.whenStable();
    expect(navigate).toHaveBeenCalledOnce();
    expect(focus).not.toHaveBeenCalled();
    expect(state.open()).toBe(false);
  });
});
