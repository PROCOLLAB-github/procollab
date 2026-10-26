/** @format */

import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { firstValueFrom, Observable } from "rxjs";
import snakecaseKeys from "snakecase-keys";
import { CamelcaseInterceptor } from "@core/lib/interceptors/camelcase.interceptor";
import { API_URL } from "@core/lib/providers";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { SolutionRepositoryPort } from "@domain/solution/ports/solution.repository.port";
import { SolutionRepository } from "@infrastructure/repository/solution/solution.repository";
import { solutionContractScenarios } from "@domain/solution/solution-contract.fixture";
import {
  GetSolutionManagerAnalyticsUseCase,
  GetSolutionManagerAssignmentsUseCase,
  GetSolutionManagerAssignmentUseCase,
  GetSolutionManagerSolutionsUseCase,
  ExportSolutionAnalyticsUseCase,
} from "./use-cases/solution-manager-analytics.use-cases";

describe("C00 manager solution analytics wire contract", () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: "https://local.test" },
        { provide: HTTP_INTERCEPTORS, useClass: CamelcaseInterceptor, multi: true },
        { provide: LoggerService, useValue: { warn: vi.fn() } },
        { provide: SolutionRepositoryPort, useExisting: SolutionRepository },
      ],
    }),
  );
  afterEach(() => TestBed.inject(HttpTestingController).verify());
  const root = "https://local.test/programs/12/management/solution-analytics/";
  const paths: Record<string, string> = {
    getSolutionManagerAnalytics: "",
    getSolutionManagerAssignments: "assignments/",
    getSolutionManagerAssignment: "assignments/801/",
    getSolutionManagerSolutions: "solutions/",
    exportSolutionProgramAnalytics: "export/",
  };
  function execute(operationId: string, programId = 12): Observable<unknown> {
    switch (operationId) {
      case "getSolutionManagerAnalytics":
        return TestBed.inject(GetSolutionManagerAnalyticsUseCase).execute(programId);
      case "getSolutionManagerAssignments":
        return TestBed.inject(GetSolutionManagerAssignmentsUseCase).execute(programId);
      case "getSolutionManagerAssignment":
        return TestBed.inject(GetSolutionManagerAssignmentUseCase).execute(programId, 801);
      case "getSolutionManagerSolutions":
        return TestBed.inject(GetSolutionManagerSolutionsUseCase).execute(programId);
      case "exportSolutionProgramAnalytics":
        return TestBed.inject(ExportSolutionAnalyticsUseCase).execute(programId);
      default:
        throw new Error("Unexpected operation " + operationId);
    }
  }
  it.each(solutionContractScenarios.filter(row => row.operationId in paths))(
    "preserves actual references, 0/null and C00 errors for $name",
    async scenario => {
      const pending = firstValueFrom(execute(scenario.operationId));
      const request = TestBed.inject(HttpTestingController).expectOne(
        root + paths[scenario.operationId],
      );
      expect(request.request.method).toBe("GET");
      expect(request.request.params.keys()).toEqual([]);
      const body = snakecaseKeys(scenario.response as object, { deep: true });
      request.flush(
        scenario.operationId === "exportSolutionProgramAnalytics"
          ? new Blob([JSON.stringify(body)], { type: "application/json" })
          : body,
        { status: scenario.status, statusText: scenario.status === 200 ? "OK" : "Error" },
      );
      expect(await pending).toEqual(
        scenario.status === 200
          ? { ok: true, value: scenario.response }
          : { ok: false, error: scenario.response },
      );
    },
  );
  it("uses snake_case solution filters and preserves limit/offset and source scope", async () => {
    const pending = firstValueFrom(
      TestBed.inject(GetSolutionManagerSolutionsUseCase).execute(12, {
        limit: 25,
        offset: 50,
        search: "Кейс",
        caseScope: "selected",
        caseName: "Задача 1",
        submission: "submitted",
        scope: "awaiting_evaluation",
      }),
    );
    const request = TestBed.inject(HttpTestingController).expectOne(
      r => r.url === root + "solutions/",
    );
    expect(
      Object.fromEntries(
        request.request.params.keys().map(key => [key, request.request.params.get(key)]),
      ),
    ).toEqual({
      limit: "25",
      offset: "50",
      search: "Кейс",
      case_scope: "selected",
      case_name: "Задача 1",
      submission: "submitted",
      scope: "awaiting_evaluation",
    });
    request.flush({
      count: 0,
      next: null,
      previous: null,
      mode: "distributed",
      submission_applicable: true,
      results: [],
    });
    expect(await pending).toMatchObject({ ok: true, value: { count: 0, results: [] } });
  });
  it("keeps assignment completed scope on the real endpoint", async () => {
    const pending = firstValueFrom(
      TestBed.inject(GetSolutionManagerAssignmentsUseCase).execute(12, { scope: "completed" }),
    );
    const request = TestBed.inject(HttpTestingController).expectOne(
      r => r.url === root + "assignments/",
    );
    expect(request.request.params.get("scope")).toBe("completed");
    request.flush({ applicable: true, mode: "distributed", results: [] });
    expect(await pending).toMatchObject({ ok: true });
  });
  it.each(["program", "solutions", "submitted", "scores"] as const)(
    "returns original XLSX Blob for %s",
    async kind => {
      const pending = firstValueFrom(
        TestBed.inject(ExportSolutionAnalyticsUseCase).execute(12, { kind }),
      );
      const request = TestBed.inject(HttpTestingController).expectOne(
        r => r.url === root + "export/",
      );
      expect(request.request.responseType).toBe("blob");
      expect(request.request.params.keys()).toEqual(["kind"]);
      expect(request.request.params.get("kind")).toBe(kind);
      const blob = new Blob(["PK fixture"], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      request.flush(blob);
      expect(await pending).toEqual({ ok: true, value: blob });
    },
  );
  it.each([0, -1, Number.MAX_SAFE_INTEGER + 1, NaN])(
    "rejects unsafe program ID %s before every HTTP request",
    async id => {
      for (const operation of Object.keys(paths)) {
        expect(await firstValueFrom(execute(operation, id))).toMatchObject({
          ok: false,
          error: { code: "invalid_id" },
        });
      }
      TestBed.inject(HttpTestingController).expectNone(() => true);
    },
  );
  it.each([0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1])(
    "rejects unsafe assignment ID %s before HTTP",
    async id => {
      expect(
        await firstValueFrom(TestBed.inject(GetSolutionManagerAssignmentUseCase).execute(12, id)),
      ).toMatchObject({ ok: false, error: { code: "invalid_id" } });
      TestBed.inject(HttpTestingController).expectNone(() => true);
    },
  );
});
