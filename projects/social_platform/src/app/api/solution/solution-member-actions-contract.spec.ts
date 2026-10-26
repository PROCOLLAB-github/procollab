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
  SolutionMemberRemovalPreviewRequest,
  SolutionMemberRemovalApplyRequest,
} from "@domain/solution/solution-contract.model";
import {
  PreviewSolutionMemberRemovalUseCase,
  ApplySolutionMemberRemovalUseCase,
} from "./use-cases/solution-member-actions.use-cases";

describe("C00 confirmed organizer member removal", () => {
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
        ["previewSolutionMemberRemoval", "applySolutionMemberRemoval"].includes(s.operationId) &&
        !["member_removal_invalid_user", "member_removal_unknown_query"].includes(s.name),
    ),
  )("preserves selected member, proof, effects and errors: $name", async scenario => {
    const preview = scenario.operationId === "previewSolutionMemberRemoval";
    const command = (scenario.invalidRequest ??
      scenario.request) as SolutionMemberRemovalPreviewRequest & SolutionMemberRemovalApplyRequest;
    const pending = firstValueFrom<unknown>(
      preview
        ? TestBed.inject(PreviewSolutionMemberRemovalUseCase).execute(12, 301, command)
        : TestBed.inject(ApplySolutionMemberRemovalUseCase).execute(12, 301, command),
    );
    const req = TestBed.inject(HttpTestingController).expectOne(
      `https://local.test/programs/12/management/solutions/301/members/remove/${preview ? "preview" : "apply"}/`,
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

  it.each([0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])(
    "rejects invalid program/solution/user IDs before HTTP: %s",
    async id => {
      for (const [programId, solutionId, userId] of [
        [id, 301, 10],
        [12, id, 10],
        [12, 301, id],
      ]) {
        expect(
          (
            await firstValueFrom(
              TestBed.inject(PreviewSolutionMemberRemovalUseCase).execute(programId, solutionId, {
                userId,
              }),
            )
          ).ok,
        ).toBe(false);
        expect(
          (
            await firstValueFrom(
              TestBed.inject(ApplySolutionMemberRemovalUseCase).execute(programId, solutionId, {
                userId,
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

  it("preserves maximum safe IDs and exact signed token", async () => {
    const id = Number.MAX_SAFE_INTEGER,
      previewToken = " opaque =./подпись ";
    const pending = firstValueFrom(
      TestBed.inject(ApplySolutionMemberRemovalUseCase).execute(id, id, {
        userId: id,
        previewToken,
      }),
    );
    const req = TestBed.inject(HttpTestingController).expectOne(
      `https://local.test/programs/${id}/management/solutions/${id}/members/remove/apply/`,
    );
    expect(req.request.body).toEqual({ user_id: id, preview_token: previewToken });
    req.flush({ solution_id: id, solution_version: 8, updated_at: "2026-10-25T15:00:00Z" });
    expect(await pending).toEqual({
      ok: true,
      value: { solutionId: id, solutionVersion: 8, updatedAt: "2026-10-25T15:00:00Z" },
    });
  });
});
