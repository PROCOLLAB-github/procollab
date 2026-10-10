/** @format */
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { CdkTrapFocus } from "@angular/cdk/a11y";
import { provideRouter } from "@angular/router";
import { firstValueFrom, of, Subject } from "rxjs";
import { ProgramRepositoryPort } from "@domain/program/ports/program.repository.port";
import {
  caseMetrics,
  casePage,
  selectedCase,
} from "@domain/program/program-case-analytics.fixture";
import { ProgramCaseSelection } from "@domain/program/program-case-analytics.model";
import { ProgramAnalyticsDrilldownService } from "@api/program/facades/detail/program-analytics-drilldown.service";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { AnalyticsDrilldownComponent } from "./analytics-drilldown.component";
import { HttpErrorResponse } from "@angular/common/http";
import { throwError } from "rxjs";

describe("Case drilldown в существующем Overlay", () => {
  const repo = { getCaseProjects: vi.fn(), exportCaseProjects: vi.fn() };
  let fixture: ComponentFixture<AnalyticsDrilldownComponent>;
  let state: ProgramAnalyticsDrilldownService;
  let modal: ModalComponent;
  let trigger: HTMLButtonElement;
  const dialog = () => document.querySelector<HTMLElement>('[role="dialog"]')!;
  const button = (text: string) =>
    [...dialog().querySelectorAll("button")].find(el => el.textContent?.trim() === text)!;

  beforeEach(async () => {
    repo.getCaseProjects.mockReset().mockReturnValue(of(casePage()));
    repo.exportCaseProjects.mockReset();
    await TestBed.configureTestingModule({
      imports: [AnalyticsDrilldownComponent],
      providers: [provideRouter([]), { provide: ProgramRepositoryPort, useValue: repo }],
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
  async function open(selection: ProgramCaseSelection = selectedCase): Promise<void> {
    const attached = firstValueFrom(modal.overlayRef!.attachments());
    fixture.componentInstance.openCase(selection, caseMetrics, true, trigger);
    await attached;
    await fixture.whenStable();
  }

  it("selected: четыре колонки, реальные поля, null presentation и только один modal", async () => {
    await open();
    expect(dialog().querySelector("h2")?.textContent).toBe("Кейс: Цифровая трансформация");
    expect(
      [...dialog().querySelectorAll(".analytics-case__metrics dt")].map(el => el.textContent),
    ).toEqual(["Проекты", "Участники", "Сдано"]);
    expect([...dialog().querySelectorAll("th")].map(el => el.textContent)).toEqual([
      "Проект",
      "Лидер / команда",
      "Сдача решения",
      "Презентация",
    ]);
    for (const text of [
      "Анна Иванова",
      "Размер команды: 3",
      "Сдано",
      "Не сдано",
      "Не добавлена",
      "Найдено: 2",
    ])
      expect(dialog().textContent).toContain(text);
    expect(dialog().querySelector("a")?.getAttribute("href")).toBe("/office/projects/73");
    const link = dialog().querySelector('a[target="_blank"]')!;
    expect(link.getAttribute("href")).toBe("https://example.org/deck.pdf");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(1);
    expect(dialog().textContent).not.toContain("Назначений экспертов");
    expect(dialog().querySelectorAll("td[data-label]")).toHaveLength(8);
  });
  it("without_case не требует definition/options и не превращается в selected по label", async () => {
    repo.getCaseProjects.mockReturnValue(
      of(
        casePage({
          selection: { scope: "without_case", caseName: null },
          casesConfigured: false,
          results: casePage().results.map(item => ({
            ...item,
            case: { kind: "without_case", name: null },
          })),
        }),
      ),
    );
    await open({ scope: "without_case" });
    expect(dialog().querySelector("h2")?.textContent).toBe("Без выбранного кейса");
    expect(dialog().textContent).toContain("больше недоступен");
    expect(button("Выгрузить проекты кейса").disabled).toBe(false);
    expect(repo.getCaseProjects.mock.lastCall?.[1].selection).toEqual({ scope: "without_case" });
  });
  it("zero case, затем search/no results сохраняет full-case export", async () => {
    repo.getCaseProjects.mockReturnValue(
      of(
        casePage({
          count: 0,
          results: [],
          caseMetrics: { projectsTotal: 0, participantsTotal: 0, submitted: 0, notSubmitted: 0 },
        }),
      ),
    );
    await open();
    expect(dialog().textContent).toContain("В этом кейсе пока нет проектов");
    expect(button("Выгрузить проекты кейса").disabled).toBe(true);
    const input = dialog().querySelector("input")!;
    input.value = "  нет совпадений  ";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    repo.getCaseProjects.mockReturnValue(of(casePage({ count: 0, results: [] })));
    button("Найти").click();
    await fixture.whenStable();
    expect(repo.getCaseProjects.mock.lastCall?.[1].search).toBe("нет совпадений");
    expect(dialog().textContent).toContain("По запросу ничего не найдено");
    expect(button("Выгрузить проекты кейса").disabled).toBe(false);
    button("Очистить").click();
    await fixture.whenStable();
    expect(input.value).toBe("");
  });
  it("loading сохраняет metrics и закрытие отменяет request, late response не открывает modal", async () => {
    const pending = new Subject();
    repo.getCaseProjects.mockReturnValue(pending);
    await open();
    expect(dialog().textContent).toContain("Загружаем список");
    expect(dialog().querySelector("dl")?.textContent).toContain("Проекты2");
    expect(button("Выгрузить проекты кейса").disabled).toBe(true);
    const detached = firstValueFrom(modal.overlayRef!.detachments());
    dialog()
      .querySelector<HTMLButtonElement>('[aria-label="Закрыть детализацию аналитики"]')!
      .click();
    await detached;
    await fixture.whenStable();
    expect(pending.observed).toBe(false);
    pending.next(casePage());
    expect(state.open()).toBe(false);
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
  it.each([
    [401, "Авторизуйтесь"],
    [403, "нет доступа"],
    [404, "Программа не найдена"],
    [400, "Настройки кейса изменились"],
    [500, "Проверьте соединение"],
  ])("ошибка %s контролируется; retry только сетевой", async (status, message) => {
    repo.getCaseProjects.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: Number(status) })),
    );
    await open();
    expect(dialog().querySelector('[role="alert"]')?.textContent).toContain(message);
    expect(button("Выгрузить проекты кейса").disabled).toBe(true);
    if (status === 500) {
      repo.getCaseProjects.mockReturnValue(of(casePage()));
      button("Повторить загрузку").click();
      await fixture.whenStable();
      expect(dialog().querySelector("table")).not.toBeNull();
    }
  });
  it("legacy response не включает экспорт", async () => {
    repo.getCaseProjects.mockReturnValue(of({ count: 2, results: [{ id: 73 }] }));
    await open();
    expect(dialog().textContent).toContain("пока недоступна на сервере");
    button("Выгрузить проекты кейса").click();
    expect(repo.exportCaseProjects).not.toHaveBeenCalled();
  });
  it("noncompetitive: сдача не требуется, evaluation не добавляется", async () => {
    repo.getCaseProjects.mockReturnValue(of(casePage({ submissionApplicable: false })));
    await open();
    expect(dialog().querySelector("dl")?.textContent).not.toContain("Сдано");
    expect(dialog().querySelector('[data-label="Сдача решения"]')?.textContent).toContain(
      "Не требуется",
    );
    expect(dialog().textContent).not.toContain("Оцен");
  });
  it("тот же focus trap/close focus/Escape; смена программы отменяет контекст", async () => {
    await open();
    const close = dialog().querySelector('[aria-label="Закрыть детализацию аналитики"]');
    expect(document.activeElement).toBe(close);
    const trap = fixture.debugElement.query(By.directive(CdkTrapFocus)).injector.get(CdkTrapFocus);
    expect(trap.enabled).toBe(true);
    const detached = firstValueFrom(modal.overlayRef!.detachments());
    close!.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await detached;
    await fixture.whenStable();
    expect(document.activeElement).toBe(trigger);
    await open();
    const pending = new Subject();
    repo.getCaseProjects.mockReturnValue(pending);
    state.cases.load();
    fixture.componentRef.setInput("programId", 99);
    await fixture.whenStable();
    expect(pending.observed).toBe(false);
    expect(state.open()).toBe(false);
    expect(state.cases.page()).toBeNull();
  });
});
