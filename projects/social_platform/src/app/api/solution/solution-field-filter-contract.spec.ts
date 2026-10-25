/** @format */

import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { firstValueFrom } from "rxjs";
import snakecaseKeys from "snakecase-keys";
import { CamelcaseInterceptor } from "@core/lib/interceptors/camelcase.interceptor";
import { API_URL } from "@core/lib/providers";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { SolutionRepositoryPort } from "@domain/solution/ports/solution.repository.port";
import { SolutionRepository } from "@infrastructure/repository/solution/solution.repository";
import { solutionContractScenarios } from "@domain/solution/solution-contract.fixture";
import {
  GetSolutionManagerSolutionsUseCase,
  ExportSolutionAnalyticsUseCase,
} from "./use-cases/solution-manager-analytics.use-cases";

describe("C00 configurable solution field filters and matching XLSX", () => {
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
  const filters = {
    search: "Кейс",
    caseScope: "selected",
    caseName: "Задача 1",
    submission: "submitted",
    scope: "awaiting_evaluation",
    fieldId: 31,
  } as const;
  const params = (request: { params: { keys(): string[]; get(key: string): string | null } }) =>
    Object.fromEntries(request.params.keys().map(key => [key, request.params.get(key)]));

  it.each(["all", "present", "missing", "not_applicable"] as const)(
    "passes field and %s through actual interceptor with existing filters before pagination",
    async answerState => {
      const pending = firstValueFrom(
        TestBed.inject(GetSolutionManagerSolutionsUseCase).execute(12, {
          ...filters,
          answerState,
          limit: 5,
          offset: 20,
        }),
      );
      const request = TestBed.inject(HttpTestingController).expectOne(
        r => r.url === root + "solutions/",
      );
      expect(params(request.request)).toEqual({
        search: "Кейс",
        case_scope: "selected",
        case_name: "Задача 1",
        submission: "submitted",
        scope: "awaiting_evaluation",
        field_id: "31",
        answer_state: answerState,
        limit: "5",
        offset: "20",
      });
      const page = solutionContractScenarios.find(
        row => row.name === "manager_solution_list_awaiting",
      )!.response as object;
      request.flush(snakecaseKeys(page, { deep: true }));
      expect(await pending).toEqual({ ok: true, value: page });
    },
  );
  for (const kind of ["solutions", "submitted"] as const) {
    it.each(["present", "missing", "not_applicable"] as const)(
      `exports all matching ${kind} with %s without pagination`,
      async answerState => {
        const pending = firstValueFrom(
          TestBed.inject(ExportSolutionAnalyticsUseCase).execute(12, {
            kind,
            ...filters,
            answerState,
          }),
        );
        const request = TestBed.inject(HttpTestingController).expectOne(
          r => r.url === root + "export/",
        );
        expect(request.request.responseType).toBe("blob");
        expect(params(request.request)).toEqual({
          kind,
          search: "Кейс",
          case_scope: "selected",
          case_name: "Задача 1",
          submission: "submitted",
          scope: "awaiting_evaluation",
          field_id: "31",
          answer_state: answerState,
        });
        const book = new Blob(["PK filtered fixture"], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        request.flush(book);
        expect(await pending).toEqual({ ok: true, value: book });
      },
    );
  }
  it.each(
    solutionContractScenarios.filter(
      row => row.name.startsWith("manager_export_") && row.status === 400,
    ),
  )("decodes C00 JSON from filtered export Blob for $name", async scenario => {
    const pending = firstValueFrom(
      TestBed.inject(ExportSolutionAnalyticsUseCase).execute(12, {
        kind: "solutions",
        fieldId: 31,
        answerState: "present",
      }),
    );
    const request = TestBed.inject(HttpTestingController).expectOne(
      r => r.url === root + "export/",
    );
    request.flush(
      new Blob([JSON.stringify(snakecaseKeys(scenario.response as object, { deep: true }))], {
        type: "application/json",
      }),
      { status: 400, statusText: "Bad Request" },
    );
    expect(await pending).toEqual({ ok: false, error: scenario.response });
  });
  it.each([0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1, NaN, Infinity])(
    "rejects unsafe field ID %s before list or file HTTP",
    async fieldId => {
      for (const call of [
        () =>
          TestBed.inject(GetSolutionManagerSolutionsUseCase).execute(12, {
            fieldId,
            answerState: "present",
          }),
        () =>
          TestBed.inject(ExportSolutionAnalyticsUseCase).execute(12, {
            kind: "solutions",
            fieldId,
            answerState: "present",
          }),
      ])
        expect(await firstValueFrom(call())).toMatchObject({
          ok: false,
          error: { code: "invalid_id" },
        });
      TestBed.inject(HttpTestingController).expectNone(() => true);
    },
  );
});
