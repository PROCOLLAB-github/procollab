/** @format */
import { TestBed } from "@angular/core/testing";
import { of, Subject } from "rxjs";
import { ok, fail } from "@domain/shared/result.type";
import { SolutionExpertsComponent } from "./solution-experts.component";
import { EvaluationUseCase } from "@api/program/use-cases/evaluation.use-case";
import {
  GetSolutionExpertAssignmentsUseCase,
  SaveSolutionExpertAssignmentsUseCase,
  PreviewSolutionQuotaUseCase,
  SaveSolutionQuotaUseCase,
} from "@api/solution/use-cases/solution-evaluation.use-cases";
import {
  GetSolutionManagerAssignmentsUseCase,
  GetSolutionManagerSolutionsUseCase,
} from "@api/solution/use-cases/solution-manager-analytics.use-cases";
import { SolutionAssignmentOptions, SolutionQuota } from "@domain/solution/solution-contract.model";
const option = (id: number, assigned: boolean, protectedScore = false) => ({
  solutionId: id,
  name: `Решение ${id}`,
  caseName: "Город",
  submitted: true,
  assigned,
  protected: protectedScore,
  isCompleted: false,
  ownTeam: false,
  eligible: true,
});
function setup() {
  const expert = {
    id: 11,
    userId: 7,
    name: "Эксперт",
    email: "fixture@example.test",
    status: "joined",
    assigned: 999,
    completed: 999,
    remaining: 999,
    allCases: true,
    caseNames: [],
  };
  const roster = {
    workspace: vi.fn(() =>
      of({
        revision: "r1",
        experts: [expert],
        cases: ["Город", "Образование"],
        requiredEvaluators: 1,
      }),
    ),
    saveCaseScope: vi.fn(() => of({})),
  };
  const assignments = {
    execute: vi.fn(() =>
      of(
        ok({
          results: [
            {
              assignmentId: 1,
              expert: { expertId: 11 },
              application: { solutionId: 301 },
              status: "pending",
            },
          ],
        }),
      ),
    ),
  };
  const solutions = { execute: vi.fn(() => of(ok({ count: 0, results: [] }))) };
  const options = {
    execute: vi.fn(() =>
      of(
        ok({
          programId: 12,
          expertId: 11,
          revision: "r1",
          solutions: [option(301, true, true), option(302, false)],
        } satisfies SolutionAssignmentOptions),
      ),
    ),
  };
  const save = { execute: vi.fn(() => new Subject<ReturnType<typeof ok>>()) };
  const quota = {
    execute: vi.fn(() => of(ok({ revision: "r1", requiredEvaluators: 2 } as SolutionQuota))),
  };
  TestBed.configureTestingModule({
    imports: [SolutionExpertsComponent],
    providers: [
      { provide: EvaluationUseCase, useValue: roster },
      { provide: GetSolutionManagerAssignmentsUseCase, useValue: assignments },
      { provide: GetSolutionManagerSolutionsUseCase, useValue: solutions },
      { provide: GetSolutionExpertAssignmentsUseCase, useValue: options },
      { provide: SaveSolutionExpertAssignmentsUseCase, useValue: save },
      { provide: PreviewSolutionQuotaUseCase, useValue: quota },
      { provide: SaveSolutionQuotaUseCase, useValue: save },
    ],
  });
  TestBed.overrideComponent(SolutionExpertsComponent, { set: { template: "" } });
  const fixture = TestBed.createComponent(SolutionExpertsComponent);
  fixture.componentRef.setInput("programId", 12);
  fixture.componentRef.setInput("confirmDiscard", async () => true);
  fixture.detectChanges();
  return {
    fixture,
    c: fixture.componentInstance,
    expert: fixture.componentInstance.experts()[0],
    roster,
    assignments,
    options,
    save,
    quota,
  };
}
describe("Solution expert management", () => {
  it("ignores every Project counter in the existing expert roster", () => {
    const { c } = setup();
    expect(c.experts()[0]).toMatchObject({ assigned: 1, completed: 0, remaining: 1 });
    expect(c.counts(301)).toEqual({ assigned: 1, completed: 0 });
  });
  it("retains scored assignments and saves explicit solution IDs exactly once", () => {
    const { c, expert, save } = setup();
    c.open("assignments", expert);
    c.toggleSolution(301);
    c.toggleSolution(302);
    c.saveAssignments();
    c.saveAssignments();
    expect(save.execute).toHaveBeenCalledExactlyOnceWith(12, 11, {
      revision: "r1",
      solutionIds: [301, 302],
    });
    expect(c.busy()).toBe(true);
  });
  it("cancels old options when changing program and clears the selected roster", () => {
    const { fixture, c, expert, options } = setup();
    const old = new Subject<ReturnType<typeof ok<SolutionAssignmentOptions>>>();
    options.execute.mockReturnValue(old);
    c.open("assignments", expert);
    fixture.componentRef.setInput("programId", 13);
    fixture.detectChanges();
    old.next(ok({ programId: 12, expertId: 11, revision: "old", solutions: [option(999, true)] }));
    old.complete();
    expect(c.options()).toBeNull();
    expect(c.modal()).toBeNull();
  });
  it("does not apply a quota preview after the number changes", () => {
    const { fixture, c, save } = setup();
    c.open("quota");
    c.quota.setValue(2);
    c.previewQuota();
    c.quota.setValue(3);
    fixture.detectChanges();
    c.saveQuota();
    expect(save.execute).not.toHaveBeenCalled();
  });
  it("unchecking one case from all cases keeps the other cases", () => {
    const { c } = setup();
    c.open("invite");
    c.toggleScope("Город");
    expect(c.scopeAll()).toBe(false);
    expect([...c.scopeCases()]).toEqual(["Образование", null]);
  });
  it("asks about unsaved changes only after changing the reviewed values", () => {
    const { c, expert } = setup();
    c.open("scope", expert);
    expect(c.dirty()).toBe(false);
    c.toggleScope("Город");
    expect(c.dirty()).toBe(true);
    c.discard();
    c.open("assignments", expert);
    expect(c.dirty()).toBe(false);
    c.toggleSolution(302);
    expect(c.dirty()).toBe(true);
    c.discard();
    c.open("quota");
    expect(c.dirty()).toBe(false);
    c.quota.setValue(2);
    TestBed.flushEffects();
    expect(c.dirty()).toBe(true);
  });
  it("refreshes a rejected assignment revision while retaining valid choices and without automatic apply", () => {
    const { c, expert, save, options } = setup();
    c.open("assignments", expert);
    c.toggleSolution(302);
    save.execute.mockReturnValue(
      of(fail({ code: "stale_assignments", detail: "Изменилось", errors: [], meta: {} })),
    );
    c.saveAssignments();
    expect(c.options()).toBeNull();
    options.execute.mockReturnValue(
      of(
        ok({
          programId: 12,
          expertId: 11,
          revision: "r2",
          solutions: [option(301, true, true), option(302, false)],
        }),
      ),
    );
    c.refreshDialog();
    expect([...c.selectedSolutions()]).toEqual([301, 302]);
    expect(c.options()?.revision).toBe("r2");
    expect(save.execute).toHaveBeenCalledTimes(1);
  });
});
