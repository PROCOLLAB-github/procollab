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
import { SolutionArchiveApplyRequest } from "@domain/solution/solution-contract.model";
import {
  PreviewSolutionArchiveUseCase,
  ApplySolutionArchiveUseCase,
} from "./use-cases/solution-archive.use-cases";
import { GetSolutionUseCase } from "./use-cases/solution.use-cases";

describe("C00 retained solution archive", () => {
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
      s =>
        ["previewSolutionArchive", "applySolutionArchive"].includes(s.operationId) &&
        !["archive_invalid_empty_selection", "archive_invalid_duplicate_selection"].includes(
          s.name,
        ),
    ),
  )("preserves bulk selection, proof, effects and errors: $name", async scenario => {
    const preview = scenario.operationId === "previewSolutionArchive";
    const command = (scenario.invalidRequest ?? scenario.request) as SolutionArchiveApplyRequest;
    const pending = firstValueFrom<unknown>(
      preview
        ? TestBed.inject(PreviewSolutionArchiveUseCase).execute(12, command)
        : TestBed.inject(ApplySolutionArchiveUseCase).execute(12, command),
    );
    const req = TestBed.inject(HttpTestingController).expectOne(
      `https://local.test/programs/12/management/solutions/archive/${preview ? "preview" : "apply"}/`,
    );
    expect(req.request.method).toBe("POST");
    expect(req.request.params.keys()).toEqual([]);
    expect(req.request.body).toEqual(snakecaseKeys(command, { deep: true }));
    req.flush(snakecaseKeys(scenario.response as object, { deep: true }), {
      status: scenario.status,
      statusText: scenario.status === 200 ? "OK" : "Error",
    });
    expect(await pending).toEqual(
      scenario.status === 200
        ? { ok: true, value: scenario.response }
        : { ok: false, error: scenario.response },
    );
    TestBed.inject(HttpTestingController).expectNone(req =>
      req.url.startsWith("https://local.test"),
    );
  });

  it.each([
    [],
    [301, 301],
    [0],
    [-1],
    [1.5],
    [NaN],
    [Infinity],
    [Number.MAX_SAFE_INTEGER + 1],
    Array.from({ length: 10001 }, (_, i) => i + 1),
  ])("rejects invalid or duplicate selection before HTTP %#", async ids => {
    expect(
      (await firstValueFrom(TestBed.inject(PreviewSolutionArchiveUseCase).execute(12, { ids }))).ok,
    ).toBe(false);
    expect(
      (
        await firstValueFrom(
          TestBed.inject(ApplySolutionArchiveUseCase).execute(12, { ids, previewToken: "opaque" }),
        )
      ).ok,
    ).toBe(false);
    TestBed.inject(HttpTestingController).expectNone(req =>
      req.url.startsWith("https://local.test"),
    );
  });

  it.each(["active", "archived", "all"] as const)(
    "sends explicit participation filter %s",
    async participation => {
      const pending = firstValueFrom(
        TestBed.inject(SolutionRepositoryPort).list(12, { participation, offset: 20, limit: 10 }),
      );
      const req = TestBed.inject(HttpTestingController).expectOne(
        r => r.url === "https://local.test/programs/12/solutions/",
      );
      expect(req.request.params.get("participation")).toBe(participation);
      expect(req.request.params.get("offset")).toBe("20");
      req.flush({ count: 0, next: null, previous: null, results: [] });
      expect(await pending).toEqual({ count: 0, next: null, previous: null, results: [] });
    },
  );

  it.each(
    solutionContractScenarios.filter(s =>
      ["archive_read_submitted_owner", "archive_read_draft_owner"].includes(s.name),
    ),
  )("retains archived materials without changing submission state: $name", async scenario => {
    const pending = firstValueFrom(TestBed.inject(GetSolutionUseCase).execute(12, 301));
    const req = TestBed.inject(HttpTestingController).expectOne(
      "https://local.test/programs/12/solutions/301/",
    );
    req.flush(snakecaseKeys(scenario.response as object, { deep: true }));
    expect(await pending).toEqual({ ok: true, value: scenario.response });
  });
});
