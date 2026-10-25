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
  SolutionCaseChangePreviewRequest,
  SolutionCaseChangeApplyRequest,
} from "@domain/solution/solution-contract.model";
import {
  PreviewSolutionCaseChangeUseCase,
  ApplySolutionCaseChangeUseCase,
} from "./use-cases/solution-case-actions.use-cases";

describe("C00 confirmed solution case change", () => {
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
    solutionContractScenarios.filter(s =>
      ["previewSolutionCaseChange", "applySolutionCaseChange"].includes(s.operationId),
    ),
  )("preserves exact cases, token/null, version and errors: $name", async scenario => {
    const preview = scenario.operationId === "previewSolutionCaseChange";
    const response = scenario.response as {
      application?: { programId: number; solutionId: number };
    };
    const programId = response.application?.programId ?? 12,
      solutionId = response.application?.solutionId ?? 301;
    const command = (scenario.request as SolutionCaseChangePreviewRequest | undefined) ?? {
      caseName: "Образование | наука",
    };
    const confirmation = (scenario.request as SolutionCaseChangeApplyRequest | undefined) ?? {
      caseName: command.caseName,
      previewToken: "opaque-case-preview-token",
    };
    const pending = firstValueFrom<unknown>(
      preview
        ? TestBed.inject(PreviewSolutionCaseChangeUseCase).execute(programId, solutionId, command)
        : TestBed.inject(ApplySolutionCaseChangeUseCase).execute(
            programId,
            solutionId,
            confirmation,
          ),
    );
    const req = TestBed.inject(HttpTestingController).expectOne(
      `https://local.test/programs/${programId}/management/solutions/${solutionId}/case/${preview ? "preview" : "apply"}/`,
    );
    expect(req.request.method).toBe("POST");
    expect(req.request.params.keys()).toEqual([]);
    expect(req.request.body).toEqual(
      snakecaseKeys(preview ? command : confirmation, { deep: true }),
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
  it.each([0, -1, Number.MAX_SAFE_INTEGER + 1, 1.5, NaN, Infinity])(
    "rejects unsafe IDs %s before HTTP",
    async id => {
      for (const [programId, solutionId] of [
        [id, 301],
        [12, id],
      ]) {
        expect(
          (
            await firstValueFrom(
              TestBed.inject(PreviewSolutionCaseChangeUseCase).execute(programId, solutionId, {
                caseName: "A",
              }),
            )
          ).ok,
        ).toBe(false);
        expect(
          (
            await firstValueFrom(
              TestBed.inject(ApplySolutionCaseChangeUseCase).execute(programId, solutionId, {
                caseName: "A",
                previewToken: "opaque",
              }),
            )
          ).ok,
        ).toBe(false);
      }
      TestBed.inject(HttpTestingController).expectNone(req =>
        req.url.startsWith("https://local.test"),
      );
    },
  );
  it("does not normalize spaces, pipe, ID boundary or signed token", async () => {
    const caseName = "  Город | Образование  ",
      previewToken = " opaque =./подпись ";
    const pending = firstValueFrom(
      TestBed.inject(ApplySolutionCaseChangeUseCase).execute(
        Number.MAX_SAFE_INTEGER,
        Number.MAX_SAFE_INTEGER,
        { caseName, previewToken },
      ),
    );
    const req = TestBed.inject(HttpTestingController).expectOne(
      `https://local.test/programs/${Number.MAX_SAFE_INTEGER}/management/solutions/${Number.MAX_SAFE_INTEGER}/case/apply/`,
    );
    expect(req.request.body).toEqual({ case_name: caseName, preview_token: previewToken });
    req.flush({
      solution_id: Number.MAX_SAFE_INTEGER,
      solution_version: 8,
      updated_at: "2026-10-25T10:00:00Z",
    });
    expect(await pending).toEqual({
      ok: true,
      value: {
        solutionId: Number.MAX_SAFE_INTEGER,
        solutionVersion: 8,
        updatedAt: "2026-10-25T10:00:00Z",
      },
    });
  });
});
