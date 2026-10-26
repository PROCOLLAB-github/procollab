/** @format */

import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from "@angular/router";
import { BehaviorSubject, of, Subject } from "rxjs";
import { GetSolutionRatingsUseCase } from "@api/solution/use-cases/solution-evaluation.use-cases";
import { ProgramDetailMainUIInfoService } from "@api/program/facades/detail/ui/program-detail-main-ui-info.service";
import { SolutionRatingPage } from "@domain/solution/solution-contract.model";
import { solutionContractScenarios } from "@domain/solution/solution-contract.fixture";
import { ok, fail } from "@domain/shared/result.type";
import { SolutionEvaluationListComponent } from "./solution-evaluation-list.component";

async function setup(initial: Record<string, string> = {}) {
  const response = structuredClone(
    solutionContractScenarios.find(s => s.operationId === "getSolutionRatings" && s.status === 200)!
      .response,
  ) as SolutionRatingPage;
  response.evaluationCounts = { pending: 7, completed: 12 };
  response.caseOptions = ["Задача 1", "Задача 2"];
  const params = new BehaviorSubject(convertToParamMap({ programId: "12" }));
  const query = new BehaviorSubject(convertToParamMap(initial));
  const route = { paramMap: params, queryParamMap: query, pathFromRoot: [] as unknown[] };
  route.pathFromRoot = [route];
  const get = { execute: vi.fn(() => of(ok(response))) };
  TestBed.configureTestingModule({
    imports: [SolutionEvaluationListComponent],
    providers: [
      provideRouter([]),
      { provide: ActivatedRoute, useValue: route },
      { provide: GetSolutionRatingsUseCase, useValue: get },
      {
        provide: ProgramDetailMainUIInfoService,
        useValue: { program: signal({ id: 12, name: "Кейс-чемпионат" }) },
      },
    ],
  });
  const fixture = TestBed.createComponent(SolutionEvaluationListComponent);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  return { response, fixture, page: fixture.componentInstance, params, query, get };
}

describe("Solution expert list", () => {
  it("uses server counts before pagination and real solution links", async () => {
    const { page, fixture, response } = await setup();
    expect(page.counts()).toEqual({ pending: 7, completed: 12 });
    expect(fixture.nativeElement.textContent).toContain("Осталось оценить · 7");
    const row = response.results[0];
    if (row)
      expect(
        fixture.nativeElement.querySelector(".rating-list__rows a")?.getAttribute("href"),
      ).toContain(`/solutions/${row.application.solutionId}/evaluation`);
    expect(page.caseOptions()).toEqual(["Задача 1", "Задача 2"]);
  });
  it("restores query filters/status/page and resets pagination on changing status", async () => {
    const { page, get } = await setup({
      status: "completed",
      q: "Кейс",
      case: "Задача 2",
      page: "2",
    });
    expect(get.execute).toHaveBeenCalledWith(12, {
      status: "completed",
      search: "Кейс",
      caseScope: "selected",
      caseName: "Задача 2",
      limit: 20,
      offset: 20,
    });
    const navigate = vi.spyOn(TestBed.inject(Router), "navigate").mockResolvedValue(true);
    page.setStatus("pending");
    expect(navigate).toHaveBeenCalledWith(
      [],
      expect.objectContaining({
        queryParams: { status: null, page: null },
        queryParamsHandling: "merge",
      }),
    );
    page.openFilters();
    page.caseValue.setValue("Задача 1");
    page.filtersOpen.set(false);
    page.openFilters();
    expect(page.caseValue.value).toBe("Задача 2");
  });
  it("requires server counts and shows actual errors instead of inventing numbers", async () => {
    const { page, get, response, fixture } = await setup();
    delete response.evaluationCounts;
    page.reload();
    fixture.detectChanges();
    expect(page.data()).toBeNull();
    expect(page.error()?.code).toBe("missing_counts");
    get.execute.mockReturnValue(
      of(
        fail({ code: "not_program_expert", detail: "Нет доступа.", errors: [], meta: {} }),
      ) as never,
    );
    page.reload();
    expect(page.error()?.code).toBe("not_program_expert");
  });
  it("cancels previous-program reads and keeps the current scope when late data arrives", async () => {
    const { page, get, params, response } = await setup();
    const pending = new Subject<ReturnType<typeof ok<SolutionRatingPage>>>();
    get.execute.mockReturnValue(pending);
    page.reload();
    get.execute.mockReturnValue(of(ok({ ...response, results: [], count: 0 })));
    params.next(convertToParamMap({ programId: "99" }));
    pending.next(ok(response));
    expect(get.execute).toHaveBeenLastCalledWith(99, expect.anything());
    expect(page.data()?.results).toEqual([]);
  });
});
