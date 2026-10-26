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
import { GetSolutionCaseAnalyticsUseCase } from "./solution-analytics.use-cases";

describe("Solution case analytics through actual HTTP adapter", () => {
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

  it.each(solutionContractScenarios.filter(row => row.operationId === "getSolutionCaseAnalytics"))(
    "preserves scoped aggregates, 0/null and C00 errors for $name",
    async scenario => {
      const pending = firstValueFrom(TestBed.inject(GetSolutionCaseAnalyticsUseCase).execute(12));
      const request = TestBed.inject(HttpTestingController).expectOne(
        "https://local.test/programs/12/management/solution-cases/",
      );
      expect(request.request.method).toBe("GET");
      expect(request.request.params.keys()).toEqual([]);
      request.flush(snakecaseKeys(scenario.response as object, { deep: true }), {
        status: scenario.status,
        statusText: scenario.status === 200 ? "OK" : "Error",
      });
      expect(await pending).toEqual(
        scenario.status === 200
          ? { ok: true, value: scenario.response }
          : { ok: false, error: scenario.response },
      );
    },
  );
  it.each([0, -1, Number.MAX_SAFE_INTEGER + 1, NaN])(
    "rejects unsafe program ID %s before HTTP",
    async programId => {
      expect(
        await firstValueFrom(TestBed.inject(GetSolutionCaseAnalyticsUseCase).execute(programId)),
      ).toMatchObject({ ok: false, error: { code: "invalid_id" } });
      TestBed.inject(HttpTestingController).expectNone(() => true);
    },
  );
});
