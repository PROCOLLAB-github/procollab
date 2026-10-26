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
import { ProgramSolution } from "@domain/solution/solution-contract.model";
import {
  UpdateSolutionUseCase,
  UploadSolutionFileUseCase,
  SubmitSolutionUseCase,
} from "./use-cases/solution-draft.use-cases";

describe("C00 draft and original upload wire", () => {
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
  it("submits only the saved expected versions through the exact solution-scoped route", async () => {
    const command = { expectedVersion: 9, expectedFormRevision: "a".repeat(64) };
    const result = firstValueFrom(TestBed.inject(SubmitSolutionUseCase).execute(12, 301, command));
    const request = TestBed.inject(HttpTestingController).expectOne(
      "https://local.test/programs/12/solutions/301/submit/",
    );
    expect(request.request.method).toBe("POST");
    expect(request.request.body).toEqual({
      expected_version: 9,
      expected_form_revision: command.expectedFormRevision,
    });
    const expected = solutionContractScenarios.find(s => s.name === "submit_success")!
      .response as ProgramSolution;
    request.flush(snakecaseKeys(expected, { deep: true }));
    expect(await result).toEqual({ ok: true, value: expected });
  });
  it("PATCH uses both expected versions and preserves null, zero, false and exact option strings", async () => {
    const command = {
      expectedVersion: 2,
      expectedFormRevision: "a".repeat(64),
      name: "Решение",
      answers: [
        { fieldId: 1, value: null },
        { fieldId: 2, value: 0 },
        { fieldId: 3, value: false },
        { fieldId: 4, value: "API_v2" },
      ],
    };
    const result = firstValueFrom(TestBed.inject(UpdateSolutionUseCase).execute(12, 301, command));
    const request = TestBed.inject(HttpTestingController).expectOne(
      "https://local.test/programs/12/solutions/301/",
    );
    expect(request.request.method).toBe("PATCH");
    expect(request.request.body).toEqual(snakecaseKeys(command, { deep: true }));
    const expected = solutionContractScenarios.find(s => s.name === "created_solo")!
      .response as ProgramSolution;
    request.flush(snakecaseKeys(expected, { deep: true }));
    expect(await result).toEqual({ ok: true, value: expected });
  });
  it("posts a single multipart file with optional preserve_original and the old url response", async () => {
    const file = new File(["image"], "image.png", { type: "image/png" });
    const result = firstValueFrom(TestBed.inject(UploadSolutionFileUseCase).execute(file));
    const request = TestBed.inject(HttpTestingController).expectOne(
      "https://local.test/files/?preserve_original=true",
    );
    expect(request.request.method).toBe("POST");
    expect(request.request.body).toBeInstanceOf(FormData);
    expect([...request.request.body.keys()]).toEqual(["file"]);
    expect(request.request.body.get("file")).toMatchObject({
      name: file.name,
      size: file.size,
      type: file.type,
    });
    request.flush({ url: "https://cdn.test/original.png" });
    expect(await result).toEqual({ ok: true, value: { url: "https://cdn.test/original.png" } });
  });
  it("does not automatically retry a failed write", async () => {
    const result = firstValueFrom(
      TestBed.inject(UpdateSolutionUseCase).execute(12, 301, {
        expectedVersion: 1,
        expectedFormRevision: "a".repeat(64),
        answers: [],
      }),
    );
    TestBed.inject(HttpTestingController)
      .expectOne("https://local.test/programs/12/solutions/301/")
      .flush(
        { code: "version_conflict", detail: "Обновите заявку", errors: [], meta: {} },
        { status: 409, statusText: "Conflict" },
      );
    expect((await result).ok).toBe(false);
    TestBed.inject(HttpTestingController).expectNone(
      "https://local.test/programs/12/solutions/301/",
    );
  });
});
