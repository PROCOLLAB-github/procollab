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
  PreviewSolutionExpertReminderUseCase,
  ConfirmSolutionExpertReminderUseCase,
} from "./use-cases/solution-manager-analytics.use-cases";

describe("C00 solution expert reminder wire contract", () => {
  const root =
    "https://local.test/programs/12/management/solution-analytics/attention/solutions-awaiting-evaluation/";

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
      ["previewSolutionExpertReminder", "confirmSolutionExpertReminder"].includes(row.operationId),
    ),
  )("preserves counts, null token and C00 errors for $name", async scenario => {
    const preview = scenario.operationId === "previewSolutionExpertReminder";
    const pending = firstValueFrom<unknown>(
      preview
        ? TestBed.inject(PreviewSolutionExpertReminderUseCase).execute(12, {
            selection: { mode: "all" },
          })
        : TestBed.inject(ConfirmSolutionExpertReminderUseCase).execute(12, "opaque.token"),
    );
    const request = TestBed.inject(HttpTestingController).expectOne(
      root + (preview ? "reminder-preview/" : "reminders/"),
    );
    expect(request.request.method).toBe("POST");
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
  });

  it("sends all-found exclusions and actual solution IDs through the interceptor", async () => {
    const pending = firstValueFrom(
      TestBed.inject(PreviewSolutionExpertReminderUseCase).execute(12, {
        search: "Кейс",
        selection: { mode: "all", excludedIds: [301, 304] },
      }),
    );
    const request = TestBed.inject(HttpTestingController).expectOne(root + "reminder-preview/");
    expect(request.request.body).toEqual({
      search: "Кейс",
      selection: { mode: "all", excluded_ids: [301, 304] },
    });
    request.flush(
      { code: "validation_error", detail: "Проверка", errors: [], meta: {} },
      {
        status: 400,
        statusText: "Error",
      },
    );
    expect((await pending).ok).toBe(false);
  });

  it("sends selected solution IDs and leaves confirmation token opaque", async () => {
    const preview = firstValueFrom(
      TestBed.inject(PreviewSolutionExpertReminderUseCase).execute(12, {
        selection: { mode: "selected", ids: [301, 302] },
      }),
    );
    const request = TestBed.inject(HttpTestingController).expectOne(root + "reminder-preview/");
    expect(request.request.body).toEqual({ selection: { mode: "selected", ids: [301, 302] } });
    request.flush({
      token: "opaque.signed-token:_",
      selected_count: 2,
      recipient_count: 1,
      without_assignments_count: 0,
      unavailable_count: 0,
      preview_text: "Текст",
      recipients: [{ user_id: 27, full_name: "Анна Петрова" }],
      expires_in: 900,
    });
    const result = await preview;
    expect(result.ok).toBe(true);
    if (!result.ok || result.value.token === null) throw new Error("Expected token");
    const confirmation = firstValueFrom(
      TestBed.inject(ConfirmSolutionExpertReminderUseCase).execute(12, result.value.token),
    );
    const confirmRequest = TestBed.inject(HttpTestingController).expectOne(root + "reminders/");
    expect(confirmRequest.request.body).toEqual({ token: "opaque.signed-token:_" });
    confirmRequest.flush({ created_count: 0, skipped_count: 1 });
    expect(await confirmation).toEqual({ ok: true, value: { createdCount: 0, skippedCount: 1 } });
  });

  it.each([0, -1, NaN, Number.MAX_SAFE_INTEGER + 1])(
    "rejects unsafe program ID %s before creating HTTP request",
    async programId => {
      const result = await firstValueFrom(
        TestBed.inject(PreviewSolutionExpertReminderUseCase).execute(programId, {
          selection: { mode: "all" },
        }),
      );
      expect(result.ok).toBe(false);
    },
  );
});
