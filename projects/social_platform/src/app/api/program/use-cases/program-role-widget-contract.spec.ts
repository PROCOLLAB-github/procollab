/** @format */

import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { firstValueFrom } from "rxjs";
import snakecaseKeys from "snakecase-keys";
import { CamelcaseInterceptor } from "@core/lib/interceptors/camelcase.interceptor";
import { API_URL } from "@core/lib/providers";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { ProgramRepositoryPort } from "@domain/program/ports/program.repository.port";
import { ProgramRepository } from "@infrastructure/repository/program/program.repository";
import { solutionContractScenarios } from "@domain/solution/solution-contract.fixture";
import { GetProgramRoleWidgetUseCase } from "./get-program-role-widget.use-case";

describe("C00 role widget through the actual HTTP adapter", () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: "https://local.test" },
        { provide: HTTP_INTERCEPTORS, useClass: CamelcaseInterceptor, multi: true },
        { provide: LoggerService, useValue: { warn: vi.fn() } },
        { provide: ProgramRepositoryPort, useExisting: ProgramRepository },
      ],
    }),
  );
  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it.each([
    "solution_widget_participant_snapshot",
    "solution_widget_organizer_noncompetitive",
    "solution_widget_expert_zero_complete",
    "legacy_widget_participant",
    "legacy_widget_organizer",
    "legacy_widget_expert",
  ])("keeps real references, zero/null and the %s payload", async name => {
    const expected = solutionContractScenarios.find(row => row.name === name)!.response;
    const result = firstValueFrom(TestBed.inject(GetProgramRoleWidgetUseCase).execute(12));
    const request = TestBed.inject(HttpTestingController).expectOne(
      "https://local.test/programs/12/analytics-widget/",
    );
    expect(request.request.method).toBe("GET");
    request.flush(snakecaseKeys(expected as object, { deep: true }));
    expect(await result).toEqual({ ok: true, value: expected });
  });
  it.each([
    [401, "unauthorized"],
    [409, "integrity"],
  ])("preserves status %s without displaying the raw DRF body", async (status, kind) => {
    const result = firstValueFrom(TestBed.inject(GetProgramRoleWidgetUseCase).execute(12));
    TestBed.inject(HttpTestingController)
      .expectOne("https://local.test/programs/12/analytics-widget/")
      .flush({ detail: "private raw error" }, { status: Number(status), statusText: "Error" });
    expect(await result).toEqual({ ok: false, error: kind });
  });
});
