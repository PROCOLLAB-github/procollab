/** @format */
import { TestBed } from "@angular/core/testing";
import { of, Subject } from "rxjs";
import { ok, fail } from "@domain/shared/result.type";
import { EvaluationUseCase } from "@api/program/use-cases/evaluation.use-case";
import {
  PreviewSolutionAllocationUseCase,
  ApplySolutionAllocationUseCase,
} from "@api/solution/use-cases/solution-evaluation.use-cases";
import { SolutionAllocationPlan } from "@domain/solution/solution-contract.model";
import { solutionContractScenarios } from "@domain/solution/solution-contract.fixture";
import { SolutionAllocationComponent } from "./solution-allocation.component";

const plan = solutionContractScenarios.find(s => s.name === "solution_allocation_preview")!
  .response as SolutionAllocationPlan;
describe("Назначения из выбранных заявок решения", () => {
  const roster = { workspace: vi.fn() },
    preview = { execute: vi.fn() },
    apply = { execute: vi.fn() };
  beforeEach(() => {
    roster.workspace.mockReset().mockReturnValue(
      of({
        revision: "solution-revision",
        experts: [
          { id: 11, status: "joined", name: "Эксперт", email: "expert@example.test" },
          { id: "invite-12", status: "pending" },
        ],
        projects: [{ id: 999 }],
      }),
    );
    preview.execute.mockReset().mockReturnValue(of(ok(structuredClone(plan))));
    apply.execute.mockReset().mockReturnValue(of(ok({})));
    TestBed.configureTestingModule({
      providers: [
        { provide: EvaluationUseCase, useValue: roster },
        { provide: PreviewSolutionAllocationUseCase, useValue: preview },
        { provide: ApplySolutionAllocationUseCase, useValue: apply },
      ],
    });
  });
  async function setup() {
    const fixture = TestBed.createComponent(SolutionAllocationComponent);
    fixture.componentRef.setInput("request", { programId: 12, ids: [301, 302] });
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture.componentInstance;
  }
  it("использует выбранные solution IDs и принятых экспертов, игнорирует Project IDs в общем roster", async () => {
    const component = await setup();
    expect(component.experts().map(e => e.id)).toEqual([11]);
    component.toggle(11);
    component.preview();
    expect(preview.execute).toHaveBeenCalledExactlyOnceWith(12, {
      revision: "solution-revision",
      expertIds: [11],
      solutionIds: [301, 302],
    });
    expect(apply.execute).not.toHaveBeenCalled();
  });
  it("изменение выбора отменяет старый preview и исключает применение его токена", async () => {
    const component = await setup();
    const old = new Subject<ReturnType<typeof ok<SolutionAllocationPlan>>>();
    preview.execute.mockReturnValue(old);
    component.toggle(11);
    component.preview();
    component.toggle(11);
    old.next(ok(plan));
    old.complete();
    component.confirm();
    expect(component.plan()).toBeNull();
    expect(apply.execute).not.toHaveBeenCalled();
  });
  it("запись применяет только server plan token и блокирует повтор/закрытие", async () => {
    const component = await setup(),
      pending = new Subject<ReturnType<typeof ok>>();
    apply.execute.mockReturnValue(pending);
    const closed = vi.fn();
    component.closed.subscribe(closed);
    component.toggle(11);
    component.preview();
    component.confirm();
    component.confirm();
    component.close();
    expect(apply.execute).toHaveBeenCalledExactlyOnceWith(12, plan.planToken);
    expect(closed).not.toHaveBeenCalled();
    pending.next(ok({}));
    pending.complete();
    expect(component.busy()).toBe(false);
  });
  it("ошибка записи сбрасывает план и сохраняет выбранных экспертов без автоматической записи", async () => {
    const component = await setup();
    apply.execute.mockReturnValue(
      of(fail({ code: "stale_plan", detail: "План устарел", errors: [], meta: {} })),
    );
    component.toggle(11);
    component.preview();
    component.confirm();
    component.confirm();
    expect(component.plan()).toBeNull();
    expect([...component.selected()]).toEqual([11]);
    expect(component.error()).toBe("План устарел");
    expect(apply.execute).toHaveBeenCalledTimes(1);
  });
});
