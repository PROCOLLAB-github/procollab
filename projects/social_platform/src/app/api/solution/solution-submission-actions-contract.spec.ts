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
  SolutionActionPreviewRequest,
  SolutionActionApplyRequest,
} from "@domain/solution/solution-contract.model";
import {
  PreviewSolutionSubmitActionUseCase,
  ApplySolutionSubmitActionUseCase,
} from "./use-cases/solution-submission-actions.use-cases";

describe("C00 organizer first solution submission", () => {
  const root = "https://local.test/programs/12/management/solutions/actions/";
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
      ["previewSolutionSubmitAction", "applySolutionSubmitAction"].includes(row.operationId),
    ),
  )("preserves C00 counts, nullable token and errors: $name", async scenario => {
    const preview = scenario.operationId === "previewSolutionSubmitAction";
    const selection = (scenario.request as SolutionActionPreviewRequest | undefined) ?? {
      action: "submit",
      ids: [301],
    };
    const confirmation = (scenario.request as SolutionActionApplyRequest | undefined) ?? {
      action: "submit",
      ids: [301],
      previewToken: "opaque-preview-token",
    };
    const pending = firstValueFrom<unknown>(
      preview
        ? TestBed.inject(PreviewSolutionSubmitActionUseCase).execute(12, selection)
        : TestBed.inject(ApplySolutionSubmitActionUseCase).execute(12, confirmation),
    );
    const req = TestBed.inject(HttpTestingController).expectOne(
      root + (preview ? "preview/" : "apply/"),
    );
    expect(req.request.method).toBe("POST");
    expect(req.request.params.keys()).toEqual([]);
    expect(req.request.body).toEqual(
      snakecaseKeys(preview ? selection : confirmation, { deep: true }),
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
  });

  it.each([0, -1, Number.MAX_SAFE_INTEGER + 1, 1.5, NaN])(
    "rejects unsafe program or solution ID %s before HTTP",
    async id => {
      const preview = TestBed.inject(PreviewSolutionSubmitActionUseCase),
        apply = TestBed.inject(ApplySolutionSubmitActionUseCase);
      for (const [programId, ids] of [
        [id, [301]],
        [12, [id]],
      ] as const) {
        expect(
          (await firstValueFrom(preview.execute(programId, { action: "submit", ids: [...ids] })))
            .ok,
        ).toBe(false);
        expect(
          (
            await firstValueFrom(
              apply.execute(programId, { action: "submit", ids: [...ids], previewToken: "opaque" }),
            )
          ).ok,
        ).toBe(false);
      }
      TestBed.inject(HttpTestingController).expectNone(request =>
        request.url.startsWith("https://local.test"),
      );
    },
  );

  it("rejects empty/oversized selection before HTTP without silently changing IDs", async () => {
    for (const ids of [[], Array.from({ length: 10001 }, () => 301)]) {
      expect(
        (
          await firstValueFrom(
            TestBed.inject(PreviewSolutionSubmitActionUseCase).execute(12, {
              action: "submit",
              ids,
            }),
          )
        ).ok,
      ).toBe(false);
    }
    TestBed.inject(HttpTestingController).expectNone(request =>
      request.url.startsWith("https://local.test"),
    );
  });
});
