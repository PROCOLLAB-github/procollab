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
import { SolutionRegistrationRemovalApplyRequest } from "@domain/solution/solution-contract.model";
import {
  PreviewSolutionRegistrationRemovalUseCase,
  ApplySolutionRegistrationRemovalUseCase,
  ListSolutionRegistrationRemovalsUseCase,
  ReadSolutionRegistrationRemovalUseCase,
} from "./use-cases/solution-registration-removal.use-cases";
import { ReadSolutionAdminChangeUseCase } from "./use-cases/solution-history.use-cases";

describe("C00 registration removal with retained program work", () => {
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
      s => s.name.startsWith("registration_removal_") && !s.invalidRequest,
    ),
  )("uses registration IDs, signed proof and typed audit: $name", async scenario => {
    const command = scenario.request as SolutionRegistrationRemovalApplyRequest;
    let path: string;
    let pending: Promise<unknown>;
    let method = "POST";
    switch (scenario.operationId) {
      case "previewSolutionRegistrationRemoval":
        path = "/registrations/remove/preview/";
        pending = firstValueFrom(
          TestBed.inject(PreviewSolutionRegistrationRemovalUseCase).execute(12, command),
        );
        break;
      case "applySolutionRegistrationRemoval":
        path = "/registrations/remove/apply/";
        pending = firstValueFrom(
          TestBed.inject(ApplySolutionRegistrationRemovalUseCase).execute(12, command),
        );
        break;
      case "listSolutionRegistrationRemovals":
        method = "GET";
        path = "/registrations/removals/";
        pending = firstValueFrom(
          TestBed.inject(ListSolutionRegistrationRemovalsUseCase).execute(12),
        );
        break;
      case "readSolutionRegistrationRemoval":
        method = "GET";
        path = "/registrations/removals/801/";
        pending = firstValueFrom(
          TestBed.inject(ReadSolutionRegistrationRemovalUseCase).execute(12, 801),
        );
        break;
      case "readSolutionAdminChange":
        method = "GET";
        path = "/solutions/301/history/901/";
        pending = firstValueFrom(
          TestBed.inject(ReadSolutionAdminChangeUseCase).execute(12, 301, 901),
        );
        break;
      default:
        throw new Error(`Unexpected operation ${scenario.operationId}`);
    }
    const req = TestBed.inject(HttpTestingController).expectOne(
      `https://local.test/programs/12/management${path}`,
    );
    expect(req.request.method).toBe(method);
    expect(req.request.params.keys()).toEqual([]);
    expect(req.request.body).toEqual(
      method === "POST" ? snakecaseKeys(command, { deep: true }) : null,
    );
    req.flush(snakecaseKeys(scenario.response as object, { deep: true }), {
      status: scenario.status,
      statusText: scenario.status === 200 ? "OK" : "Error",
    });
    expect(await pending).toEqual(
      scenario.status === 200
        ? { ok: true, value: scenario.response }
        : { ok: false, error: scenario.response },
    );
    TestBed.inject(HttpTestingController).expectNone(r => r.url.includes("/projects/"));
  });

  it.each([
    [],
    [601, 601],
    [0],
    [-1],
    [1.5],
    [NaN],
    [Infinity],
    [Number.MAX_SAFE_INTEGER + 1],
    Array.from({ length: 10001 }, (_, i) => i + 1),
  ])("rejects invalid registration selection before HTTP %#", async registrationIds => {
    expect(
      (
        await firstValueFrom(
          TestBed.inject(PreviewSolutionRegistrationRemovalUseCase).execute(12, {
            registrationIds,
          }),
        )
      ).ok,
    ).toBe(false);
    expect(
      (
        await firstValueFrom(
          TestBed.inject(ApplySolutionRegistrationRemovalUseCase).execute(12, {
            registrationIds,
            previewToken: "opaque",
          }),
        )
      ).ok,
    ).toBe(false);
    TestBed.inject(HttpTestingController).expectNone(r => r.url.startsWith("https://local.test"));
  });
  it("sends audit pagination in the query", async () => {
    const pending = firstValueFrom(
      TestBed.inject(ListSolutionRegistrationRemovalsUseCase).execute(12, {
        offset: 20,
        limit: 10,
      }),
    );
    const req = TestBed.inject(HttpTestingController).expectOne(
      r => r.url === "https://local.test/programs/12/management/registrations/removals/",
    );
    expect(req.request.params.get("offset")).toBe("20");
    expect(req.request.params.get("limit")).toBe("10");
    req.flush({ count: 0, offset: 20, limit: 10, results: [] });
    expect(await pending).toEqual({
      ok: true,
      value: { count: 0, offset: 20, limit: 10, results: [] },
    });
  });
});
