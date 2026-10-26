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
  GetPublishedSolutionUseCase,
  GetPublishedSolutionsUseCase,
} from "./use-cases/solution-publication.use-cases";

describe("C00 published solution wire contract", () => {
  const root = "https://local.test/programs/14/published-solutions/";
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

  it.each(
    solutionContractScenarios.filter(row =>
      ["getPublishedSolutions", "getPublishedSolution"].includes(row.operationId),
    ),
  )("preserves public allowlist, 0/False/null and errors for $name", async scenario => {
    const list = scenario.operationId === "getPublishedSolutions";
    const pending = firstValueFrom<unknown>(
      list
        ? TestBed.inject(GetPublishedSolutionsUseCase).execute(14)
        : TestBed.inject(GetPublishedSolutionUseCase).execute(14, 501),
    );
    const request = TestBed.inject(HttpTestingController).expectOne(root + (list ? "" : "501/"));
    expect(request.request.method).toBe("GET");
    expect(request.request.body).toBeNull();
    expect(request.request.headers.has("Authorization")).toBe(false);
    request.flush(snakecaseKeys(scenario.response as object, { deep: true }), {
      status: scenario.status,
      statusText: scenario.status === 200 ? "OK" : "Error",
    });
    expect(await pending).toEqual(
      scenario.status === 200
        ? { ok: true, value: scenario.response }
        : { ok: false, error: scenario.response },
    );
  });

  it("uses program-scoped list, search and offset without private filters", async () => {
    const pending = firstValueFrom(
      TestBed.inject(GetPublishedSolutionsUseCase).execute(14, {
        search: "Прототип",
        limit: 25,
        offset: 50,
      }),
    );
    const request = TestBed.inject(HttpTestingController).expectOne(req => req.url === root);
    expect(request.request.params.keys().sort()).toEqual(["limit", "offset", "search"]);
    expect(request.request.params.get("offset")).toBe("50");
    expect(request.request.params.get("search")).toBe("Прототип");
    request.flush({ program_id: 14, count: 0, next: null, previous: null, results: [] });
    expect(await pending).toEqual({
      ok: true,
      value: { programId: 14, count: 0, next: null, previous: null, results: [] },
    });
  });

  it.each([0, -1, NaN, Number.MAX_SAFE_INTEGER + 1])(
    "rejects unsafe program %s before HTTP",
    async id => {
      expect(
        (await firstValueFrom(TestBed.inject(GetPublishedSolutionsUseCase).execute(id))).ok,
      ).toBe(false);
    },
  );
  it.each([0, -1, NaN, Number.MAX_SAFE_INTEGER + 1])(
    "rejects unsafe solution %s before HTTP",
    async id => {
      expect(
        (await firstValueFrom(TestBed.inject(GetPublishedSolutionUseCase).execute(14, id))).ok,
      ).toBe(false);
    },
  );
});
