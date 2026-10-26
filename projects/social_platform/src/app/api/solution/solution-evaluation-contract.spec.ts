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
import { SolutionCabinetApplications } from "@domain/solution/solution-contract.model";
import {
  GetSolutionRatingsUseCase,
  GetSolutionRatingUseCase,
  RateSolutionUseCase,
  GetSolutionExpertAssignmentsUseCase,
  SaveSolutionExpertAssignmentsUseCase,
  PreviewSolutionAllocationUseCase,
  ApplySolutionAllocationUseCase,
  PreviewSolutionQuotaUseCase,
  SaveSolutionQuotaUseCase,
  GetSolutionResultsUseCase,
  GetCabinetApplicationsUseCase,
} from "./use-cases/solution-evaluation.use-cases";

const example = (name: string) =>
  solutionContractScenarios.find(row => row.name === name)!.response;
const root = "https://local.test/programs/12/";

describe("C00 solution evaluation wire contract", () => {
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

  it("preserves kind and equal IDs across projects and solutions in one cabinet page", async () => {
    const pending = firstValueFrom(
      TestBed.inject(GetCabinetApplicationsUseCase).execute({
        status: "pending",
        q: "Работа",
        limit: 20,
        offset: 0,
      }),
    );
    const req = TestBed.inject(HttpTestingController).expectOne(
      request => request.url === "https://local.test/evaluation/applications/",
    );
    expect(req.request.params.has("program_id")).toBe(false);
    expect(req.request.params.get("q")).toBe("Работа");
    const expected = example("mixed_cabinet_applications") as SolutionCabinetApplications;
    req.flush(snakecaseKeys(expected, { deep: true }));
    expect(await pending).toEqual({ ok: true, value: expected });
    const filtered = firstValueFrom(
      TestBed.inject(GetCabinetApplicationsUseCase).execute({ programId: 12 }),
    );
    const selected = TestBed.inject(HttpTestingController).expectOne(
      request => request.url === "https://local.test/evaluation/applications/",
    );
    expect(selected.request.params.get("program_id")).toBe("12");
    const page = {
      ...expected,
      count: 1,
      results: expected.results.filter(row => row.program.id === 12),
    };
    selected.flush(snakecaseKeys(page, { deep: true }));
    expect(await filtered).toEqual({ ok: true, value: page });
  });

  it("encodes filters once in snake case and preserves false, zero and exact case names", async () => {
    const pending = firstValueFrom(
      TestBed.inject(GetSolutionRatingsUseCase).execute(12, {
        search: "API_v2",
        caseScope: "selected",
        caseName: "API_v2 & ML",
        status: "pending",
        assignedOnly: false,
        limit: 20,
        offset: 0,
      }),
    );
    const req = TestBed.inject(HttpTestingController).expectOne(
      request => request.url === root + "solution-evaluation/",
    );
    expect(req.request.method).toBe("GET");
    expect(req.request.params.keys()).toEqual([
      "search",
      "case_scope",
      "case_name",
      "status",
      "assigned_only",
      "limit",
      "offset",
    ]);
    expect(req.request.params.get("case_name")).toBe("API_v2 & ML");
    expect(req.request.params.get("assigned_only")).toBe("false");
    expect(req.request.params.get("offset")).toBe("0");
    const expected = example("evaluation_list");
    req.flush(snakecaseKeys(expected, { deep: true }));
    expect(await pending).toEqual({ ok: true, value: expected });
  });

  it("reads a real solution frame without projecting it into a Project DTO", async () => {
    const pending = firstValueFrom(TestBed.inject(GetSolutionRatingUseCase).execute(12, 301));
    const req = TestBed.inject(HttpTestingController).expectOne(root + "solutions/301/evaluation/");
    const expected = example("evaluation_frame");
    req.flush(snakecaseKeys(expected, { deep: true }));
    expect(await pending).toEqual({ ok: true, value: expected });
  });

  it("saves exactly the confirmed criteria revision and string zero/False/null", async () => {
    const command = {
      expectedCriteriaRevision: "a".repeat(64),
      scores: [
        { criterionId: 21, value: "0" },
        { criterionId: 22, value: "False" },
        { criterionId: 23, value: null },
      ],
    };
    const pending = firstValueFrom(TestBed.inject(RateSolutionUseCase).execute(12, 301, command));
    const req = TestBed.inject(HttpTestingController).expectOne(root + "solutions/301/evaluation/");
    expect(req.request.method).toBe("POST");
    expect(req.request.body).toEqual(snakecaseKeys(command, { deep: true }));
    const expected = example("evaluation_saved");
    req.flush(snakecaseKeys(expected, { deep: true }));
    expect(await pending).toEqual({ ok: true, value: expected });
  });

  it("keeps criterion errors separate from form field errors and never retries a write", async () => {
    const pending = firstValueFrom(
      TestBed.inject(RateSolutionUseCase).execute(12, 301, {
        expectedCriteriaRevision: "a".repeat(64),
        scores: [{ criterionId: 21, value: "NaN" }],
      }),
    );
    const req = TestBed.inject(HttpTestingController).expectOne(root + "solutions/301/evaluation/");
    const expected = example("evaluation_invalid_value");
    req.flush(snakecaseKeys(expected, { deep: true }), { status: 400, statusText: "Bad Request" });
    expect(await pending).toEqual({ ok: false, error: expected });
    TestBed.inject(HttpTestingController).expectNone(root + "solutions/301/evaluation/");
  });

  it("returns conflict metadata for caller-driven refresh without a second POST", async () => {
    const pending = firstValueFrom(
      TestBed.inject(RateSolutionUseCase).execute(12, 301, {
        expectedCriteriaRevision: "a".repeat(64),
        scores: [{ criterionId: 21, value: "1" }],
      }),
    );
    const req = TestBed.inject(HttpTestingController).expectOne(root + "solutions/301/evaluation/");
    const expected = example("evaluation_criteria_changed");
    req.flush(snakecaseKeys(expected, { deep: true }), { status: 409, statusText: "Conflict" });
    expect(await pending).toEqual({ ok: false, error: expected });
  });

  it("uses actual Expert IDs and solution IDs in read and full assignment replacement", async () => {
    const url = root + "management/solution-evaluation/experts/91/assignments/";
    const read = firstValueFrom(
      TestBed.inject(GetSolutionExpertAssignmentsUseCase).execute(12, 91),
    );
    const expectedRead = example("solution_assignment_options");
    TestBed.inject(HttpTestingController)
      .expectOne(url)
      .flush(snakecaseKeys(expectedRead, { deep: true }));
    expect(await read).toEqual({ ok: true, value: expectedRead });
    const command = { revision: "b".repeat(64), solutionIds: [] };
    const saved = firstValueFrom(
      TestBed.inject(SaveSolutionExpertAssignmentsUseCase).execute(12, 91, command),
    );
    const req = TestBed.inject(HttpTestingController).expectOne(url);
    expect(req.request.method).toBe("PUT");
    expect(req.request.body).toEqual({ revision: command.revision, solution_ids: [] });
    const expected = example("solution_assignments_saved");
    req.flush(snakecaseKeys(expected, { deep: true }));
    expect(await saved).toEqual({ ok: true, value: expected });
  });

  it("rejects malformed route IDs before any HTTP request", async () => {
    const read = TestBed.inject(GetSolutionRatingUseCase);
    for (const id of [0, -1, NaN, Infinity, 1.5, Number.MAX_SAFE_INTEGER + 1]) {
      const result = await firstValueFrom(read.execute(12, id));
      expect(result).toMatchObject({ ok: false, error: { code: "invalid_id" } });
    }
    expect(
      await firstValueFrom(TestBed.inject(GetSolutionRatingsUseCase).execute(0)),
    ).toMatchObject({ ok: false, error: { code: "invalid_id" } });
    expect(
      await firstValueFrom(TestBed.inject(GetSolutionExpertAssignmentsUseCase).execute(12, 0)),
    ).toMatchObject({ ok: false, error: { code: "invalid_id" } });
    TestBed.inject(HttpTestingController).expectNone(() => true);
  });

  it("previews with exact case pools and applies only the returned signed plan token", async () => {
    const command = {
      revision: "d".repeat(64),
      expertIds: [91],
      solutionIds: [301],
      casePools: [{ caseName: "API_v2", expertIds: [91] }],
      seed: 0,
      assignmentOverrides: [{ solutionId: 301, expertIds: [91] }],
    };
    const pending = firstValueFrom(
      TestBed.inject(PreviewSolutionAllocationUseCase).execute(12, command),
    );
    const url = root + "management/solution-evaluation/allocation/";
    const req = TestBed.inject(HttpTestingController).expectOne(url);
    expect(req.request.method).toBe("POST");
    expect(req.request.body).toEqual(snakecaseKeys(command, { deep: true }));
    const expected = example("solution_allocation_preview");
    req.flush(snakecaseKeys(expected, { deep: true }));
    expect(await pending).toEqual({ ok: true, value: expected });
    const applied = firstValueFrom(
      TestBed.inject(ApplySolutionAllocationUseCase).execute(12, "signed-plan"),
    );
    const apply = TestBed.inject(HttpTestingController).expectOne(url + "apply/");
    expect(apply.request.body).toEqual({ plan_token: "signed-plan" });
    const receipt = example("solution_allocation_applied");
    apply.flush(snakecaseKeys(receipt, { deep: true }));
    expect(await applied).toEqual({ ok: true, value: receipt });
  });

  it("previews quota via query and saves its revision without resending the preview body", async () => {
    const url = root + "management/solution-evaluation/quota/";
    const pending = firstValueFrom(TestBed.inject(PreviewSolutionQuotaUseCase).execute(12, 2));
    const preview = TestBed.inject(HttpTestingController).expectOne(url + "?required_evaluators=2");
    expect(preview.request.method).toBe("GET");
    const expected = example("solution_quota_preview");
    preview.flush(snakecaseKeys(expected, { deep: true }));
    expect(await pending).toEqual({ ok: true, value: expected });
    const command = { revision: "d".repeat(64), requiredEvaluators: 2 };
    const saved = firstValueFrom(TestBed.inject(SaveSolutionQuotaUseCase).execute(12, command));
    const req = TestBed.inject(HttpTestingController).expectOne(url);
    expect(req.request.method).toBe("PUT");
    expect(req.request.body).toEqual(snakecaseKeys(command, { deep: true }));
    req.flush(snakecaseKeys(expected, { deep: true }));
    expect(await saved).toEqual({ ok: true, value: expected });
  });

  it("reads organizer results with complete/pending semantics and real solution references", async () => {
    const pending = firstValueFrom(
      TestBed.inject(GetSolutionResultsUseCase).execute(12, {
        search: "Решение",
        caseScope: "selected",
        caseName: "API_v2",
        order: "asc",
        status: "complete",
      }),
    );
    const req = TestBed.inject(HttpTestingController).expectOne(
      request => request.url === root + "management/solution-results/",
    );
    expect(req.request.params.get("case_scope")).toBe("selected");
    expect(req.request.params.get("case_name")).toBe("API_v2");
    expect(req.request.params.get("status")).toBe("complete");
    const expected = example("solution_results");
    req.flush(snakecaseKeys(expected, { deep: true }));
    expect(await pending).toEqual({ ok: true, value: expected });
  });
});
