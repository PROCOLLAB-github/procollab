/** @format */
import { TestBed } from "@angular/core/testing";
import { of, Subject } from "rxjs";
import { ok } from "@domain/shared/result.type";
import { solutionContractScenarios } from "@domain/solution/solution-contract.fixture";
import {
  SolutionManagerAnalytics,
  SolutionManagerSolutions,
  SolutionReminderPreview,
} from "@domain/solution/solution-contract.model";
import { SolutionAnalyticsComponent } from "./solution-analytics.component";
import {
  GetSolutionManagerAnalyticsUseCase,
  GetSolutionManagerSolutionsUseCase,
  GetSolutionManagerAssignmentsUseCase,
  GetSolutionManagerAssignmentUseCase,
  ExportSolutionAnalyticsUseCase,
  PreviewSolutionExpertReminderUseCase,
  ConfirmSolutionExpertReminderUseCase,
} from "@api/solution/use-cases/solution-manager-analytics.use-cases";
import { GetProgramManagerParticipantsWithoutTeamUseCase } from "@api/program/use-cases/get-program-manager-participants-without-team.use-case";
import { GetProgramManagerParticipantsWithoutVisitUseCase } from "@api/program/use-cases/get-program-manager-participants-without-visit.use-case";
import { ProgramAttentionActionsUseCase } from "@api/program/use-cases/program-attention-actions.use-case";
import { saveAs } from "file-saver";
vi.mock("file-saver", () => ({ saveAs: vi.fn() }));
function value<T>(operationId: string): T {
  return structuredClone(
    solutionContractScenarios.find(s => s.operationId === operationId && s.status === 200)!
      .response,
  ) as T;
}
function setup() {
  const overview = {
    execute: vi.fn(() => of(ok(value<SolutionManagerAnalytics>("getSolutionManagerAnalytics")))),
  };
  const list = {
    execute: vi.fn(() => of(ok(value<SolutionManagerSolutions>("getSolutionManagerSolutions")))),
  };
  const preview = {
    execute: vi.fn(() => of(ok(value<SolutionReminderPreview>("previewSolutionExpertReminder")))),
  };
  const confirm = {
    execute: vi.fn(
      () => new Subject<ReturnType<typeof ok<{ createdCount: number; skippedCount: number }>>>(),
    ),
  };
  const exportApi = { execute: vi.fn(() => of(ok(new Blob(["xlsx"])))) };
  const unused = { execute: vi.fn(() => of(ok({ results: [] }))), preview: vi.fn(), send: vi.fn() };
  TestBed.configureTestingModule({
    imports: [SolutionAnalyticsComponent],
    providers: [
      { provide: GetSolutionManagerAnalyticsUseCase, useValue: overview },
      { provide: GetSolutionManagerSolutionsUseCase, useValue: list },
      { provide: GetSolutionManagerAssignmentsUseCase, useValue: unused },
      { provide: GetSolutionManagerAssignmentUseCase, useValue: unused },
      { provide: ExportSolutionAnalyticsUseCase, useValue: exportApi },
      { provide: PreviewSolutionExpertReminderUseCase, useValue: preview },
      { provide: ConfirmSolutionExpertReminderUseCase, useValue: confirm },
      { provide: GetProgramManagerParticipantsWithoutTeamUseCase, useValue: unused },
      { provide: GetProgramManagerParticipantsWithoutVisitUseCase, useValue: unused },
      { provide: ProgramAttentionActionsUseCase, useValue: unused },
    ],
  });
  TestBed.overrideComponent(SolutionAnalyticsComponent, { set: { template: "" } });
  const fixture = TestBed.createComponent(SolutionAnalyticsComponent);
  fixture.componentRef.setInput("programId", 12);
  fixture.detectChanges();
  return {
    fixture,
    component: fixture.componentInstance,
    overview,
    list,
    preview,
    confirm,
    exportApi,
  };
}
describe("Solution organizer analytics integration", () => {
  it("reads the authoritative solution overview and preserves null applicability", () => {
    const { component, overview } = setup();
    expect(overview.execute).toHaveBeenCalledExactlyOnceWith(12);
    const data = value<SolutionManagerAnalytics>("getSolutionManagerAnalytics");
    component.data.set({
      ...data,
      solutionFunnel: {
        ...data.solutionFunnel,
        submissionApplicable: false,
        submitted: null,
        evaluated: null,
      },
    });
    expect(component.solutionFunnel().map(item => item.key)).toEqual(["created"]);
    expect(component.data()?.solutionFunnel.submitted).toBeNull();
  });
  it("exports the same case/field/search filters without page limits or Project IDs", () => {
    const { component, list, exportApi } = setup();
    const filters = {
      caseScope: "selected" as const,
      caseName: "Город",
      fieldId: 41,
      answerState: "missing" as const,
    };
    component.openSolutions("Материалы", filters, document.createElement("button"));
    component.search.setValue("  Кейс  ");
    component.applySearch();
    component.download("solutions", true);
    expect(list.execute).toHaveBeenLastCalledWith(12, {
      ...filters,
      search: "Кейс",
      limit: 20,
      offset: 0,
    });
    expect(exportApi.execute).toHaveBeenCalledExactlyOnceWith(12, {
      kind: "solutions",
      ...filters,
      search: "Кейс",
    });
    expect(saveAs).toHaveBeenCalled();
  });
  it("drops stale list responses and all selection when the program changes", () => {
    const { fixture, component, list } = setup();
    const old = new Subject<ReturnType<typeof ok<SolutionManagerSolutions>>>();
    list.execute.mockReturnValue(old);
    component.openSolutions("Решения", {}, document.createElement("button"));
    component.toggle(301);
    fixture.componentRef.setInput("programId", 13);
    fixture.detectChanges();
    old.next(ok(value("getSolutionManagerSolutions")));
    old.complete();
    expect(component.modal()).toBeNull();
    expect(component.list()).toBeNull();
    expect(component.selectedCount()).toBe(0);
  });
  it("uses solution IDs for reminder review and sends only the reviewed token once", () => {
    const { component, preview, confirm } = setup();
    component.data.update(data => ({
      ...data!,
      evaluationStatus: { ...data!.evaluationStatus, mode: "distributed" },
    }));
    component.openSolutions(
      "Ожидают",
      { scope: "awaiting_evaluation" },
      document.createElement("button"),
    );
    component.toggle(301);
    component.previewReminder();
    expect(preview.execute).toHaveBeenCalledExactlyOnceWith(12, {
      search: "",
      selection: { mode: "selected", ids: [301], excludedIds: [] },
    });
    const token = component.preview()!.token;
    component.confirmReminder();
    component.confirmReminder();
    component.close();
    expect(confirm.execute).toHaveBeenCalledExactlyOnceWith(12, token);
    expect(component.modal()).toBe("solutions");
  });
  it("changing selection cancels old reminder preview without sending", () => {
    const { component, preview, confirm } = setup();
    const old = new Subject<ReturnType<typeof ok<SolutionReminderPreview>>>();
    preview.execute.mockReturnValue(old);
    component.data.update(data => ({
      ...data!,
      evaluationStatus: { ...data!.evaluationStatus, mode: "distributed" },
    }));
    component.openSolutions(
      "Ожидают",
      { scope: "awaiting_evaluation" },
      document.createElement("button"),
    );
    component.toggle(301);
    component.previewReminder();
    expect(component.actionPending()).toBe(true);
    component.toggle(302);
    expect(component.selection().ids).toEqual([301]);
    old.next(ok(value("previewSolutionExpertReminder")));
    old.complete();
    component.toggle(302);
    component.confirmReminder();
    expect(confirm.execute).not.toHaveBeenCalled();
  });
});
