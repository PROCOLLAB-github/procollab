/** @format */
import { TestBed } from "@angular/core/testing";
import { of, Subject } from "rxjs";
import { ok, fail } from "@domain/shared/result.type";
import { solutionContractScenarios } from "@domain/solution/solution-contract.fixture";
import { SolutionCaseChangePreview } from "@domain/solution/solution-contract.model";
import {
  PreviewSolutionCaseChangeUseCase,
  ApplySolutionCaseChangeUseCase,
} from "@api/solution/use-cases/solution-case-actions.use-cases";
import { SolutionCaseActionComponent } from "./solution-case-action.component";

const checked = solutionContractScenarios.find(s => s.name === "case_action_preview_ready")!
  .response as SolutionCaseChangePreview;
const problem = {
  code: "stale_preview",
  detail: "Данные изменились. Обновите данные.",
  errors: [],
  meta: {},
};
describe("Смена кейса решения на одном экране", () => {
  const preview = { execute: vi.fn() },
    apply = { execute: vi.fn() };
  beforeEach(() => {
    preview.execute.mockReset().mockReturnValue(of(ok(structuredClone(checked))));
    apply.execute.mockReset().mockReturnValue(of(ok({})));
    TestBed.configureTestingModule({
      providers: [
        { provide: PreviewSolutionCaseChangeUseCase, useValue: preview },
        { provide: ApplySolutionCaseChangeUseCase, useValue: apply },
      ],
    });
  });
  async function setup() {
    const fixture = TestBed.createComponent(SolutionCaseActionComponent);
    fixture.componentRef.setInput("request", {
      programId: 12,
      solutionId: 301,
      name: "Решение команды",
    });
    fixture.componentRef.setInput("caseOptions", [checked.caseName, "Другой кейс"]);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture;
  }
  it("показывает важные последствия вместе с выбором кейса, без второго шага", async () => {
    const fixture = await setup(),
      component = fixture.componentInstance;
    component.caseControl.setValue(checked.caseName);
    fixture.detectChanges();
    await fixture.whenStable();
    await vi.waitFor(() =>
      expect(document.querySelector('[aria-labelledby="solution-case-title"]')).not.toBeNull(),
    );
    fixture.detectChanges();
    const dialog = document.querySelector('[aria-labelledby="solution-case-title"]')!;
    expect(dialog.querySelector("select")).not.toBeNull();
    expect(dialog.textContent).toContain("Материалы, команда и оценки сохранятся");
    expect(dialog.textContent).toContain("не подходящих новому кейсу");
    expect(dialog.textContent).not.toContain("Посмотреть последствия");
    expect(dialog.querySelector('[role="tablist"]')).toBeNull();
    expect(component.canApply()).toBe(true);
    expect(apply.execute).not.toHaveBeenCalled();
  });
  it("отменяет старый preview и не применяет поздние последствия прошлого выбора", async () => {
    const fixture = await setup(),
      component = fixture.componentInstance;
    const old = new Subject<ReturnType<typeof ok<SolutionCaseChangePreview>>>();
    preview.execute
      .mockReturnValueOnce(old)
      .mockReturnValueOnce(
        of(ok({ ...checked, caseName: "Другой кейс", previewToken: "new-token" })),
      );
    component.caseControl.setValue(checked.caseName);
    component.caseControl.setValue("Другой кейс");
    old.next(ok(checked));
    old.complete();
    expect(component.preview()?.previewToken).toBe("new-token");
    component.confirm();
    expect(apply.execute).toHaveBeenCalledExactlyOnceWith(12, 301, {
      caseName: "Другой кейс",
      previewToken: "new-token",
    });
  });
  it("при ошибке apply сохраняет выбор, сбрасывает токен и требует обновления", async () => {
    const fixture = await setup(),
      component = fixture.componentInstance;
    component.caseControl.setValue(checked.caseName);
    apply.execute.mockReturnValue(of(fail(problem)));
    component.confirm();
    component.confirm();
    expect(apply.execute).toHaveBeenCalledTimes(1);
    expect(component.caseControl.value).toBe(checked.caseName);
    expect(component.preview()).toBeNull();
    expect(component.canApply()).toBe(false);
    expect(component.error()).toBe(problem.detail);
    expect(preview.execute).toHaveBeenCalledTimes(1);
    component.refresh();
    expect(preview.execute).toHaveBeenCalledTimes(2);
  });
  it("блокирует повторное применение и закрытие во время записи", async () => {
    const fixture = await setup(),
      component = fixture.componentInstance;
    const writing = new Subject<ReturnType<typeof ok>>();
    apply.execute.mockReturnValue(writing);
    component.caseControl.setValue(checked.caseName);
    const closed = vi.fn(),
      busy = vi.fn();
    component.closed.subscribe(closed);
    component.busyChange.subscribe(busy);
    component.confirm();
    component.confirm();
    component.close();
    expect(apply.execute).toHaveBeenCalledTimes(1);
    expect(closed).not.toHaveBeenCalled();
    expect(busy).toHaveBeenLastCalledWith(true);
    writing.next(ok({}));
    writing.complete();
    expect(busy).toHaveBeenLastCalledWith(false);
  });
  it("смена программы очищает выбор и исключает применение чужого токена", async () => {
    const fixture = await setup(),
      component = fixture.componentInstance;
    const old = new Subject<ReturnType<typeof ok<SolutionCaseChangePreview>>>();
    preview.execute.mockReturnValue(old);
    component.caseControl.setValue(checked.caseName);
    fixture.componentRef.setInput("request", {
      programId: 13,
      solutionId: 302,
      name: "Другая команда",
    });
    fixture.detectChanges();
    await fixture.whenStable();
    old.next(ok(checked));
    component.confirm();
    expect(component.caseControl.value).toBe("");
    expect(component.preview()).toBeNull();
    expect(apply.execute).not.toHaveBeenCalled();
  });
  it("не применяет ответ с несовпадающей ссылкой на заявку", async () => {
    const fixture = await setup(),
      component = fixture.componentInstance;
    preview.execute.mockReturnValue(
      of(ok({ ...checked, application: { ...checked.application, solutionId: 999 } })),
    );
    component.caseControl.setValue(checked.caseName);
    component.confirm();
    expect(apply.execute).not.toHaveBeenCalled();
  });
});
