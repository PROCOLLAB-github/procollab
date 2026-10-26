/** @format */
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { of } from "rxjs";
import { ok } from "@domain/shared/result.type";
import { solutionContractScenarios } from "@domain/solution/solution-contract.fixture";
import { SolutionResults } from "@domain/solution/solution-contract.model";
import { GetSolutionResultsUseCase } from "@api/solution/use-cases/solution-evaluation.use-cases";
import { ExportSolutionResultsUseCase } from "@api/solution/use-cases/solution-results-export.use-case";
import { ProgramManagementUseCase } from "@api/program/use-cases/program-management.use-case";
import { ManagementResultsComponent } from "./results.component";
vi.mock("file-saver", () => ({ saveAs: vi.fn() }));
it("uses real solution results, score links and filtered XLSX while never invoking Project results", () => {
  const data = solutionContractScenarios.find(
    s => s.operationId === "getSolutionResults" && s.status === 200,
  )!.response as SolutionResults;
  const results = { execute: vi.fn(() => of(ok(structuredClone(data)))) },
    exportApi = { execute: vi.fn(() => of(ok(new Blob()))) };
  const legacy = { results: vi.fn(), exportResults: vi.fn() };
  TestBed.configureTestingModule({
    imports: [ManagementResultsComponent],
    providers: [
      provideRouter([]),
      { provide: ProgramManagementUseCase, useValue: legacy },
      { provide: GetSolutionResultsUseCase, useValue: results },
      { provide: ExportSolutionResultsUseCase, useValue: exportApi },
    ],
  });
  const fixture = TestBed.createComponent(ManagementResultsComponent);
  fixture.componentRef.setInput("programId", 12);
  fixture.componentRef.setInput("solutionMode", true);
  fixture.detectChanges();
  const c = fixture.componentInstance,
    item = c.snapshot()!.groups.flatMap(g => g.projects)[0];
  expect(item).not.toHaveProperty("projectId");
  expect(item).toHaveProperty("application.kind", "solution");
  c.toggle(item.id);
  fixture.detectChanges();
  expect(
    fixture.nativeElement.querySelector(`a[href='/office/program/12/solutions/${item.id}']`),
  ).toBeTruthy();
  c.search.setValue("Город");
  c.caseFilter.setValue(JSON.stringify("Город"));
  c.statusFilter.setValue("pending");
  c.download();
  expect(exportApi.execute).toHaveBeenCalledExactlyOnceWith(12, {
    search: "Город",
    caseScope: "selected",
    caseName: "Город",
    order: "desc",
    scope: "current",
    status: "pending",
  });
  expect(legacy.results).not.toHaveBeenCalled();
  expect(legacy.exportResults).not.toHaveBeenCalled();
});
