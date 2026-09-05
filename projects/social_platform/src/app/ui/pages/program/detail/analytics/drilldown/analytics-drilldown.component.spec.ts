/** @format */
import { CdkTrapFocus } from "@angular/cdk/a11y";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { GetProgramManagerAssignmentsUseCase } from "@api/program/use-cases/get-program-manager-assignments.use-case";
import { GetProgramManagerAssignmentScoresUseCase } from "@api/program/use-cases/get-program-manager-assignment-scores.use-case";
import { ProgramAnalyticsDrilldownService } from "@api/program/facades/detail/program-analytics-drilldown.service";
import { ProgramAnalyticsAssignmentScope } from "@domain/program/program-analytics.model";
import { fail, ok } from "@domain/shared/result.type";
import {
  assignment,
  delayedExpert,
  scoreDetail,
} from "@domain/program/program-analytics-assignment.fixture";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { firstValueFrom, of, Subject } from "rxjs";
import { AnalyticsDrilldownComponent } from "./analytics-drilldown.component";

describe("AnalyticsDrilldownComponent: real overlay lifecycle", () => {
  let fixture: ComponentFixture<AnalyticsDrilldownComponent>;
  let modal: ModalComponent;
  let state: ProgramAnalyticsDrilldownService;
  let trigger: HTMLButtonElement;
  const assignments = { execute: vi.fn() };
  const scores = { execute: vi.fn() };
  const dialog = () => document.querySelector<HTMLElement>('[role="dialog"]')!;
  const button = (text: string) =>
    Array.from(dialog().querySelectorAll<HTMLButtonElement>("button")).find(item =>
      item.textContent?.includes(text),
    )!;

  beforeEach(async () => {
    assignments.execute.mockReset().mockReturnValue(of(ok([assignment()])));
    scores.execute.mockReset().mockReturnValue(of(ok(scoreDetail())));
    await TestBed.configureTestingModule({
      imports: [AnalyticsDrilldownComponent],
      providers: [
        { provide: GetProgramManagerAssignmentsUseCase, useValue: assignments },
        { provide: GetProgramManagerAssignmentScoresUseCase, useValue: scores },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(AnalyticsDrilldownComponent);
    fixture.componentRef.setInput("programId", 12);
    fixture.componentRef.setInput("delayedExperts", { total: 1, items: [delayedExpert()] });
    fixture.autoDetectChanges();
    await fixture.whenStable();
    modal = fixture.debugElement.query(By.directive(ModalComponent)).componentInstance;
    state = fixture.debugElement.injector.get(ProgramAnalyticsDrilldownService);
    trigger = document.createElement("button");
    trigger.textContent = "Назначений всего";
    document.body.append(trigger);
    trigger.focus();
  });

  afterEach(() => {
    fixture.destroy();
    trigger.remove();
  });

  async function open(scope: ProgramAnalyticsAssignmentScope = "all"): Promise<void> {
    const attached = firstValueFrom(modal.overlayRef!.attachments());
    fixture.componentInstance.openAssignments(scope, trigger);
    expect(document.activeElement).toBe(trigger);
    await attached;
    await fixture.whenStable();
  }

  it("initial focus только после attachment; один dialog и активный trap", async () => {
    expect(assignments.execute).not.toHaveBeenCalled();
    await open();
    expect(document.activeElement?.getAttribute("aria-label")).toBe("Закрыть аналитику назначений");
    expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(1);
    expect(dialog().getAttribute("aria-modal")).toBe("true");
    expect(dialog().getAttribute("aria-labelledby")).toBe(dialog().querySelector("h2")?.id);
    const trap = fixture.debugElement.query(By.directive(CdkTrapFocus)).injector.get(CdkTrapFocus);
    expect(trap.enabled).toBe(true);
    expect(trap.focusTrap.hasAttached()).toBe(true);
    expect(trap.autoCapture).toBe(false);
  });

  it.each(["Escape", "backdrop", "button"])(
    "%s использует единый close flow и возвращает конкретный trigger",
    async method => {
      await open();
      const close = vi.spyOn(fixture.componentInstance, "closeAnalyticsModal");
      const detached = firstValueFrom(modal.overlayRef!.detachments());
      if (method === "Escape") {
        (modal.overlayRef!.keydownEvents() as Subject<KeyboardEvent>).next(
          new KeyboardEvent("keydown", { key: "Escape" }),
        );
      } else if (method === "backdrop") {
        document.querySelector<HTMLElement>(".modal__overlay")!.click();
      } else button("×").click();
      await detached;
      await fixture.whenStable();
      expect(close).toHaveBeenCalledOnce();
      expect(state.open()).toBe(false);
      expect(state.assignments()).toEqual([]);
      expect(document.activeElement).toBe(trigger);
    },
  );

  it("disconnected trigger не получает focus", async () => {
    await open();
    trigger.remove();
    const focus = vi.spyOn(trigger, "focus");
    const detached = firstValueFrom(modal.overlayRef!.detachments());
    button("×").click();
    await detached;
    expect(focus).not.toHaveBeenCalled();
  });

  it("list/detail/back сохраняют trap, фокусируют heading и не перезагружают список", async () => {
    await open("completed");
    const trap = fixture.debugElement.query(By.directive(CdkTrapFocus)).injector.get(CdkTrapFocus);
    button("Посмотреть оценку").click();
    await fixture.whenStable();
    expect(document.activeElement).toBe(dialog().querySelector("h2"));
    expect(dialog().textContent).toContain("Оценка проекта");
    for (const text of ["8", "Хорошая проработка", "Да", "Не оценено"])
      expect(dialog().textContent).toContain(text);
    button("Назад").click();
    await fixture.whenStable();
    expect(dialog().textContent).toContain("Выполненные назначения");
    expect(document.activeElement).toBe(dialog().querySelector("h2"));
    expect(fixture.debugElement.queryAll(By.directive(CdkTrapFocus))).toHaveLength(1);
    expect(fixture.debugElement.query(By.directive(CdkTrapFocus)).injector.get(CdkTrapFocus)).toBe(
      trap,
    );
    expect(assignments.execute).toHaveBeenCalledTimes(1);
  });

  it("delayed/backlog/back сохраняют trap, исключают других экспертов, отделяют not_ready", async () => {
    assignments.execute.mockReturnValue(
      of(
        ok([
          assignment({
            assignmentId: 1,
            status: "pending",
            criteriaScored: 0,
            waitingSeconds: 187200,
          }),
          assignment({ assignmentId: 2, status: "not_ready" }),
          assignment({
            assignmentId: 3,
            status: "pending",
            expert: { ...assignment().expert, expertId: 999 },
          }),
        ]),
      ),
    );
    const attached = firstValueFrom(modal.overlayRef!.attachments());
    fixture.componentInstance.openDelayed(trigger);
    await attached;
    await fixture.whenStable();
    const trap = fixture.debugElement.query(By.directive(CdkTrapFocus)).injector.get(CdkTrapFocus);
    expect(dialog().textContent).toContain("Критическая задержка");
    expect(dialog().textContent).toContain("Выполнено 3 из 8");
    expect(dialog().textContent).toContain("2 д 4 ч");
    button("Посмотреть назначения").click();
    await fixture.whenStable();
    expect(dialog().querySelector('[data-assignment-id="3"]')).toBeNull();
    expect(dialog().textContent).toContain("Ещё не сданы");
    expect(document.activeElement).toBe(dialog().querySelector("h2"));
    button("Назад").click();
    await fixture.whenStable();
    expect(dialog().textContent).toContain("Задержки экспертов");
    expect(fixture.debugElement.query(By.directive(CdkTrapFocus)).injector.get(CdkTrapFocus)).toBe(
      trap,
    );
  });

  it.each(["unauthorized", "forbidden", "not_found", "network"] as const)(
    "%s error остаётся в модалке, retry работает",
    async kind => {
      assignments.execute.mockReturnValueOnce(of(fail({ kind })));
      await open();
      expect(dialog().querySelector('[role="alert"]')).not.toBeNull();
      expect(state.open()).toBe(true);
      button("Повторить загрузку").click();
      await fixture.whenStable();
      expect(dialog().querySelector('[role="alert"]')).toBeNull();
      expect(dialog().querySelector("table")).not.toBeNull();
    },
  );

  it("смена программы очищает trigger и закрывает без возврата фокуса", async () => {
    await open();
    const focus = vi.spyOn(trigger, "focus");
    const detached = firstValueFrom(modal.overlayRef!.detachments());
    fixture.componentRef.setInput("programId", 13);
    await detached;
    expect(state.open()).toBe(false);
    expect(focus).not.toHaveBeenCalled();
  });

  it.each([
    ["all", "Назначений экспертов пока нет"],
    ["completed", "Завершённых оценок пока нет"],
    ["pending", "Все назначения выполнены"],
  ] as const)("scope %s имеет понятный empty state", async (scope, message) => {
    assignments.execute.mockReturnValue(of(ok([])));
    await open(scope);
    expect(dialog().textContent).toContain(message);
    expect(dialog().querySelector("table")).toBeNull();
  });

  it("loading и score error сохраняют dialog; Escape из detail закрывает всё", async () => {
    const response = new Subject<ReturnType<typeof ok<ReturnType<typeof assignment>[]>>>();
    assignments.execute.mockReturnValue(response);
    await open();
    expect(dialog().querySelector('[role="status"]')?.textContent).toContain(
      "Загружаем назначения",
    );
    response.next(ok([assignment()]));
    response.complete();
    await fixture.whenStable();
    scores.execute.mockReturnValue(of(fail({ kind: "not_found" })));
    button("Посмотреть оценку").click();
    await fixture.whenStable();
    expect(dialog().textContent).toContain("Не удалось загрузить оценку");
    expect(dialog().textContent).toContain("Программа или назначение не найдены");
    const detached = firstValueFrom(modal.overlayRef!.detachments());
    document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await detached;
    expect(state.open()).toBe(false);
    expect(document.activeElement).toBe(trigger);
  });

  it("warning severity не пересчитывается и empty backlog не создаёт строки", async () => {
    assignments.execute.mockReturnValue(of(ok([])));
    fixture.componentRef.setInput("delayedExperts", {
      total: 1,
      items: [delayedExpert({ severity: "warning" })],
    });
    const attached = firstValueFrom(modal.overlayRef!.attachments());
    fixture.componentInstance.openDelayed(trigger);
    await attached;
    await fixture.whenStable();
    expect(dialog().textContent).toContain("Требует внимания");
    expect(dialog().textContent).not.toContain("Критическая задержка");
    button("Посмотреть назначения").click();
    await fixture.whenStable();
    expect(dialog().textContent).toContain("У эксперта нет ожидающих назначений");
  });

  it("не выполняет запросы для отсутствующей программы и не обрабатывает Escape без attachment", async () => {
    fixture.componentRef.setInput("programId", null);
    await fixture.whenStable();
    fixture.componentInstance.openAssignments("all", trigger);
    fixture.componentInstance.openDelayed(trigger);
    const close = vi.spyOn(fixture.componentInstance, "closeAnalyticsModal");
    (modal.overlayRef!.keydownEvents() as Subject<KeyboardEvent>).next(
      new KeyboardEvent("keydown", { key: "Escape" }),
    );
    expect(close).not.toHaveBeenCalled();
    expect(assignments.execute).not.toHaveBeenCalled();
  });

  it("destroy отписывает overlay lifecycle/keyboard и не возвращает focus", async () => {
    await open();
    const streams = [
      modal.overlayRef!.attachments(),
      modal.overlayRef!.detachments(),
      modal.overlayRef!.keydownEvents(),
    ] as Subject<unknown>[];
    const focus = vi.spyOn(trigger, "focus");
    expect(streams.every(stream => stream.observed)).toBe(true);
    fixture.destroy();
    expect(streams.every(stream => !stream.observed)).toBe(true);
    expect(focus).not.toHaveBeenCalled();
  });
});
