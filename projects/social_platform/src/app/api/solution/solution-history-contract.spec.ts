/** @format */

import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { firstValueFrom } from "rxjs";
import snakecaseKeys from "snakecase-keys";
import { CamelcaseInterceptor } from "@core/lib/interceptors/camelcase.interceptor";
import { API_URL } from "@core/lib/providers";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import {
  SolutionHistoryQuery,
  SolutionRepositoryPort,
} from "@domain/solution/ports/solution.repository.port";
import { SolutionRepository } from "@infrastructure/repository/solution/solution.repository";
import { solutionContractScenarios } from "@domain/solution/solution-contract.fixture";
import {
  ListSolutionAdminChangesUseCase,
  ReadSolutionAdminChangeUseCase,
} from "./use-cases/solution-history.use-cases";

describe("C00 administrative solution history", () => {
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
    solutionContractScenarios.filter(
      scenario =>
        ["listSolutionAdminChanges", "readSolutionAdminChange"].includes(scenario.operationId) &&
        scenario.name !== "admin_history_unknown_detail_query",
    ),
  )("preserves private revisions, nulls and controlled errors: $name", async scenario => {
    const list = scenario.operationId === "listSolutionAdminChanges";
    const query = (scenario.query ?? {}) as SolutionHistoryQuery;
    const pending = firstValueFrom<unknown>(
      list
        ? TestBed.inject(ListSolutionAdminChangesUseCase).execute(12, 301, query)
        : TestBed.inject(ReadSolutionAdminChangeUseCase).execute(12, 301, 71),
    );
    const req = TestBed.inject(HttpTestingController).expectOne(
      request =>
        request.url ===
        `https://local.test/programs/12/management/solutions/301/history/${list ? "" : "71/"}`,
    );
    expect(req.request.method).toBe("GET");
    expect(req.request.body).toBeNull();
    expect(req.request.params.keys().sort()).toEqual(Object.keys(query).sort());
    for (const [key, value] of Object.entries(query)) {
      expect(req.request.params.get(key)).toBe(String(value));
    }
    req.flush(snakecaseKeys(scenario.response as object, { deep: true }), {
      status: scenario.status,
      statusText: scenario.status === 200 ? "OK" : "Error",
    });
    expect(await pending).toEqual(
      scenario.status === 200
        ? { ok: true, value: scenario.response }
        : { ok: false, error: scenario.response },
    );
    TestBed.inject(HttpTestingController).expectNone(request =>
      request.url.startsWith("https://local.test"),
    );
  });

  it.each([0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])(
    "rejects invalid program/solution/change IDs before HTTP: %s",
    async id => {
      const list = TestBed.inject(ListSolutionAdminChangesUseCase);
      const detail = TestBed.inject(ReadSolutionAdminChangeUseCase);
      for (const result of [
        await firstValueFrom(list.execute(id, 301)),
        await firstValueFrom(list.execute(12, id)),
        await firstValueFrom(detail.execute(12, 301, id)),
      ]) {
        expect(result.ok).toBe(false);
      }
      TestBed.inject(HttpTestingController).expectNone(request =>
        request.url.startsWith("https://local.test"),
      );
    },
  );
});
