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
import { SolutionManagerSolutions } from "@domain/solution/solution-contract.model";
import { solutionContractScenarios } from "@domain/solution/solution-contract.fixture";
import { exportExperts } from "@utils/export-experts";
vi.mock("@utils/export-experts", () => ({ exportExperts: vi.fn(async () => {}) }));
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
    bulkExperts: vi.fn(() => new Subject()),
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
  it("разделяет ID экспертов и приглашений в массовом действии и запрещает повтор для смешанного выбора", () => {
    const { c, expert, roster } = setup();
    c.experts.set([
      expert,
      { ...expert, id: "invite:77", userId: null, status: "pending", invitationId: 77 },
    ]);
    c.selectAllExperts();
    c.bulk("resend");
    c.bulk("revoke");
    expect(roster.bulkExperts).not.toHaveBeenCalled();
    c.bulk("cases");
    c.scopeAll.set(false);
    c.scopeCases.set(new Set(["Город"]));
    c.bulk("cases");
    expect(roster.bulkExperts).toHaveBeenCalledExactlyOnceWith(12, {
      action: "cases",
      revision: "r1",
      expertIds: [11],
      invitationIds: [77],
      allCases: false,
      caseNames: ["Город"],
    });
  });
  it("выгружает весь фильтр экспертов независимо от страницы и массового выбора", async () => {
    const { c, expert } = setup();
    vi.mocked(exportExperts).mockClear();
    c.experts.set(Array.from({ length: 21 }, (_, i) => ({ ...expert, id: i + 1 })));
    c.page.set(1);
    c.toggleExpert(21);
    await c.downloadExperts();
    expect(exportExperts).toHaveBeenCalledTimes(1);
    expect(vi.mocked(exportExperts).mock.calls[0][0]).toBe(12);
    expect(vi.mocked(exportExperts).mock.calls[0][1]).toHaveLength(21);
    expect(c.exportSuccess()).toBe(true);
    expect(c.exporting()).toBe(false);
  });
  it("сохраняет выбранных экспертов и страницу при применении неизмененного фильтра", () => {
    const { c, expert, roster } = setup();
    c.experts.set(
      Array.from({ length: 21 }, (_, i) => ({ ...expert, id: i + 1, name: `Эксперт ${i + 1}` })),
    );
    c.status.setValue("joined");
    c.selectAllExperts();
    c.page.set(1);
    c.openFilters();
    c.applyFilters();
    expect(c.selectedExperts().size).toBe(21);
    expect(c.page()).toBe(1);
    expect(c.status.value).toBe("joined");
    expect(c.filtersOpen()).toBe(false);
    expect(roster.workspace).toHaveBeenCalledTimes(1);
  });
  it("не расширяет распределение до всех решений после применения неизмененного фильтра", () => {
    const { c } = setup();
    const source = solutionContractScenarios.find(s => s.name === "manager_solution_list_awaiting")!
      .response as SolutionManagerSolutions;
    const row = source.results[0];
    c.solutions.set([row, { ...row, application: { ...row.application, solutionId: 302 } }]);
    c.tab.set("distribution");
    c.caseFilter.setValue(JSON.stringify(row.caseName));
    c.toggleDistribution(302);
    c.openFilters();
    c.applyFilters();
    expect([...c.distributionSelection()]).toEqual([302]);
    c.startAllocation();
    expect(c.allocation()).toEqual({ programId: 12, ids: [302] });
  });
  it("applies the filter draft only on confirmation and resets selection without changing the roster API", () => {
    const { c, roster } = setup();
    c.selectAllExperts();
    expect(c.selectedExperts().size).toBe(1);
    c.openFilters();
    c.filterDraft.controls.status.setValue("pending");
    expect(c.filtered()).toHaveLength(1);
    c.filtersOpen.set(false);
    c.openFilters();
    expect(c.filterDraft.controls.status.value).toBe("all");
    c.filterDraft.controls.status.setValue("pending");
    c.applyFilters();
    expect(c.filtered()).toHaveLength(0);
    expect(c.selectedExperts().size).toBe(0);
    expect(c.filtersOpen()).toBe(false);
    expect(roster.workspace).toHaveBeenCalledTimes(1);
  });
  it("selects the filtered roster across pages and clears hidden selections when searching", () => {
    const { c, expert } = setup();
    c.experts.set(
      Array.from({ length: 21 }, (_, i) => ({ ...expert, id: i + 1, name: `Эксперт ${i + 1}` })),
    );
    c.selectAllExperts();
    expect(c.selectedExperts().size).toBe(21);
    c.page.set(1);
    expect(c.visible().map(e => e.id)).toEqual([21]);
    c.search.setValue("Эксперт 21");
    expect(c.page()).toBe(0);
    expect(c.visible().map(e => e.id)).toEqual([21]);
    expect(c.selectedExperts().size).toBe(0);
    c.selectAllExperts();
    expect([...c.selectedExperts()]).toEqual([21]);
  });
  it("allocates only selected solution IDs and clears distribution selection when the case changes", () => {
    const { c } = setup();
    const source = solutionContractScenarios.find(s => s.name === "manager_solution_list_awaiting")!
      .response as SolutionManagerSolutions;
    const row = source.results[0];
    c.solutions.set([row, { ...row, application: { ...row.application, solutionId: 302 } }]);
    c.toggleDistribution(302);
    c.startAllocation();
    expect(c.allocation()).toEqual({ programId: 12, ids: [302] });
    c.allocationBusy.set(true);
    c.startAllocation([301]);
    expect(c.allocation()?.ids).toEqual([302]);
    c.allocationBusy.set(false);
    c.caseFilter.setValue(JSON.stringify(row.caseName));
    expect(c.distributionSelection().size).toBe(0);
    c.startAllocation();
    expect(c.allocation()?.ids).toEqual([301, 302]);
  });
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
