/** @format */

import {
  HTTP_INTERCEPTORS,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { firstValueFrom, throwError } from "rxjs";
import { CamelcaseInterceptor } from "@core/lib/interceptors/camelcase.interceptor";
import { API_URL } from "@core/lib/providers";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { SolutionRepositoryPort } from "@domain/solution/ports/solution.repository.port";
import { SolutionRepository } from "@infrastructure/repository/solution/solution.repository";
import { ExportSolutionResultsUseCase } from "./use-cases/solution-results-export.use-case";

describe("C00 solution results XLSX wire contract", () => {
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

  it("uses real solution route, snake_case filters and preserves the original Blob", async () => {
    const pending = firstValueFrom(
      TestBed.inject(ExportSolutionResultsUseCase).execute(12, {
        search: "Кейс",
        caseScope: "selected",
        caseName: "Задача 1",
        order: "asc",
        status: "pending",
        scope: "current",
      }),
    );
    const request = TestBed.inject(HttpTestingController).expectOne(
      r => r.url === "https://local.test/programs/12/management/solution-results/export/",
    );
    expect(request.request.method).toBe("GET");
    expect(request.request.responseType).toBe("blob");
    expect(request.request.params.keys().sort()).toEqual([
      "case_name",
      "case_scope",
      "order",
      "scope",
      "search",
      "status",
    ]);
    expect(request.request.params.get("case_scope")).toBe("selected");
    expect(request.request.params.get("case_name")).toBe("Задача 1");
    expect(request.request.params.get("search")).toBe("Кейс");
    const blob = new Blob(["PK XLSX fixture"], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    request.flush(blob);
    expect(await pending).toEqual({ ok: true, value: blob });
  });

  it("passes scope=all without inventing project IDs or default filters", async () => {
    const pending = firstValueFrom(
      TestBed.inject(ExportSolutionResultsUseCase).execute(12, { scope: "all" }),
    );
    const request = TestBed.inject(HttpTestingController).expectOne(r =>
      r.url.endsWith("/solution-results/export/"),
    );
    expect(request.request.params.keys()).toEqual(["scope"]);
    expect(request.request.params.get("scope")).toBe("all");
    const blob = new Blob();
    request.flush(blob);
    expect(await pending).toEqual({ ok: true, value: blob });
  });

  it("decodes C00 JSON errors returned as Blob", async () => {
    const error = new HttpErrorResponse({
      status: 400,
      error: new Blob(
        [
          JSON.stringify({
            code: "invalid_filter",
            detail: "Выберите существующий кейс.",
            errors: [
              {
                path: "case_name",
                code: "invalid",
                detail: "Недоступный кейс.",
                field_id: null,
              },
            ],
            meta: { current_form_revision: "revision" },
          }),
        ],
        { type: "application/json" },
      ),
    });
    const pending = firstValueFrom(TestBed.inject(ExportSolutionResultsUseCase).execute(12));
    const request = TestBed.inject(HttpTestingController).expectOne(
      "https://local.test/programs/12/management/solution-results/export/",
    );
    request.flush(error.error, { status: 400, statusText: "Bad Request" });
    expect(await pending).toEqual({
      ok: false,
      error: {
        code: "invalid_filter",
        detail: "Выберите существующий кейс.",
        errors: [
          {
            path: "case_name",
            code: "invalid",
            detail: "Недоступный кейс.",
            fieldId: null,
          },
        ],
        meta: { currentFormRevision: "revision" },
      },
    });
  });

  it("handles a non-JSON error Blob without exposing its contents", async () => {
    vi.spyOn(TestBed.inject(SolutionRepository), "exportResults").mockReturnValue(
      throwError(
        () => new HttpErrorResponse({ status: 403, error: new Blob(["private traceback"]) }),
      ),
    );
    const result = await firstValueFrom(TestBed.inject(ExportSolutionResultsUseCase).execute(12));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("forbidden");
      expect(result.error.detail).not.toContain("traceback");
    }
  });

  it("rejects invalid program IDs before requesting a file", async () => {
    const result = await firstValueFrom(TestBed.inject(ExportSolutionResultsUseCase).execute(0));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("invalid_id");
    TestBed.inject(HttpTestingController).expectNone(() => true);
  });
});
