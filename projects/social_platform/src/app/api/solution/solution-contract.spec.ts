/** @format */

import {
  HTTP_INTERCEPTORS,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { firstValueFrom } from "rxjs";
import snakecaseKeys from "snakecase-keys";
import { CamelcaseInterceptor } from "@core/lib/interceptors/camelcase.interceptor";
import { API_URL } from "@core/lib/providers";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { SolutionRepositoryPort } from "@domain/solution/ports/solution.repository.port";
import { solutionContractScenarios } from "@domain/solution/solution-contract.fixture";
import { ProgramSolution } from "@domain/solution/solution-contract.model";
import { SolutionRepository } from "@infrastructure/repository/solution/solution.repository";
import { SolutionHttpAdapter } from "@infrastructure/adapters/solution/solution-http.adapter";
import {
  CreateSolutionUseCase,
  GetSolutionContextUseCase,
  GetSolutionUseCase,
} from "./use-cases/solution.use-cases";
import { solutionError } from "./solution-error";
import { solutionApplicationRoute } from "./solution-navigation";

describe("C00 solution API boundary", () => {
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

  it.each([
    "draft_incomplete",
    "submitted_snapshot",
    "noncompetitive",
    "hackathon_ready",
    "member_read_only",
    "expert_snapshot",
  ])("reads independent %s fixture through the actual interceptor", async name => {
    const scenario = solutionContractScenarios.find(s => s.name === name)!;
    const expected = scenario.response as ProgramSolution;
    const result = firstValueFrom(
      TestBed.inject(GetSolutionUseCase).execute(expected.programId, expected.id),
    );
    const request = TestBed.inject(HttpTestingController).expectOne(
      `https://local.test/programs/${expected.programId}/solutions/${expected.id}/`,
    );
    request.flush(snakecaseKeys(expected, { deep: true }));
    expect(await result).toEqual({ ok: true, value: expected });
  });

  it("creates without Project/Team IDs and preserves snake_case wire data", async () => {
    const result = firstValueFrom(
      TestBed.inject(CreateSolutionUseCase).execute(12, { name: "Решение" }),
    );
    const request = TestBed.inject(HttpTestingController).expectOne(
      "https://local.test/programs/12/solutions/",
    );
    expect(request.request.method).toBe("POST");
    expect(request.request.body).toEqual({ name: "Решение" });
    request.flush({ id: 88, program_id: 12, captain_id: 7 });
    expect(await result).toEqual({ ok: true, value: { id: 88, programId: 12, captainId: 7 } });
  });

  it("reads explicit legacy context and serializes pagination/filter query", async () => {
    const result = firstValueFrom(TestBed.inject(GetSolutionContextUseCase).execute(12));
    TestBed.inject(HttpTestingController)
      .expectOne("https://local.test/programs/12/solution-context/")
      .flush({ program_id: 12, storage_mode: "legacy_project" });
    expect(await result).toEqual({
      ok: true,
      value: { programId: 12, storageMode: "legacy_project" },
    });
    TestBed.inject(SolutionHttpAdapter)
      .list(12, { search: "Кейс", limit: 8, offset: 16, submission: "not_submitted" })
      .subscribe();
    const request = TestBed.inject(HttpTestingController).expectOne(r =>
      r.url.endsWith("/programs/12/solutions/"),
    );
    expect(request.request.params.get("offset")).toBe("16");
    expect(request.request.params.get("submission")).toBe("not_submitted");
    request.flush({ count: 0, next: null, previous: null, results: [] });
  });

  it.each([0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1, NaN])(
    "rejects invalid ID %s before HTTP",
    async id => {
      const result = await firstValueFrom(TestBed.inject(GetSolutionUseCase).execute(12, id));
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.code).toBe("invalid_id");
      TestBed.inject(HttpTestingController).expectNone(() => true);
    },
  );

  it("normalizes raw snake_case error issues separately from success bodies", () => {
    const error = solutionError(
      new HttpErrorResponse({
        status: 409,
        error: {
          code: "form_revision_conflict",
          detail: "Форма обновлена",
          errors: [{ path: "answers.8", code: "required", field_id: 8, detail: "Обязательно" }],
          meta: { current_version: 2 },
        },
      }),
    );
    expect(error.errors[0].fieldId).toBe(8);
    expect(error.code).toBe("form_revision_conflict");
    expect(error.meta).toEqual({ currentVersion: 2 });
    expect(
      solutionError(new HttpErrorResponse({ status: 500, error: "secret traceback" })).detail,
    ).not.toContain("secret");
  });

  it("keeps project ID, solution ID and program link ID distinct", () => {
    expect(
      solutionApplicationRoute({
        kind: "legacy_project",
        programId: 12,
        projectId: 77,
        programLinkId: 901,
        name: "Старое",
      }),
    ).toEqual({
      path: "/office/projects/77/edit",
      queryParams: { editingStep: "additional", fromProgram: true, programLinkId: 901 },
    });
    expect(
      solutionApplicationRoute({ kind: "solution", programId: 12, solutionId: 88, name: "Новое" })
        .path,
    ).toBe("/office/program/12/solutions/88");
  });
});
