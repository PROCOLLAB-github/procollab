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
import { SolutionFormWrite } from "@domain/solution/solution-contract.model";
import {
  GetSolutionFormUseCase,
  GetManagedSolutionFormUseCase,
  GetSolutionTemplatesUseCase,
  SaveManagedSolutionFormUseCase,
} from "./use-cases/solution-form.use-cases";

describe("C00 wire формы решения", () => {
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
  it("reads participant/manager forms and templates through the exact C00 routes", async () => {
    for (const [useCase, path, scenario] of [
      [GetSolutionFormUseCase, "/programs/12/solution-form/", "form"],
      [GetManagedSolutionFormUseCase, "/programs/12/management/solution-form/", "form_management"],
      [GetSolutionTemplatesUseCase, "/solution-form-templates/", "templates"],
    ] as const) {
      const source =
        useCase === GetSolutionTemplatesUseCase
          ? TestBed.inject(GetSolutionTemplatesUseCase).execute()
          : useCase === GetManagedSolutionFormUseCase
            ? TestBed.inject(GetManagedSolutionFormUseCase).execute(12)
            : TestBed.inject(GetSolutionFormUseCase).execute(12);
      const result = firstValueFrom(source),
        request = TestBed.inject(HttpTestingController).expectOne("https://local.test" + path);
      expect(request.request.method).toBe("GET");
      const expected = solutionContractScenarios.find(item => item.name === scenario)!.response;
      request.flush(snakecaseKeys(expected as object, { deep: true }));
      expect(await result).toEqual({ ok: true, value: expected });
    }
  });
  it("sends exact expected_revision, field IDs and snake_case validation in PUT", async () => {
    const command = solutionContractScenarios.find(item => item.name === "save_form")!
      .request as SolutionFormWrite;
    const result = firstValueFrom(
      TestBed.inject(SaveManagedSolutionFormUseCase).execute(12, command),
    );
    const request = TestBed.inject(HttpTestingController).expectOne(
      "https://local.test/programs/12/management/solution-form/",
    );
    expect(request.request.method).toBe("PUT");
    expect(request.request.body).toEqual(snakecaseKeys(command, { deep: true }));
    const expected = solutionContractScenarios.find(item => item.name === "save_form")!.response;
    request.flush(snakecaseKeys(expected as object, { deep: true }));
    expect(await result).toEqual({ ok: true, value: expected });
  });
  it("reports a revision conflict without retrying or discarding the command", async () => {
    const command = solutionContractScenarios.find(item => item.name === "save_form")!
      .request as SolutionFormWrite;
    const result = firstValueFrom(
      TestBed.inject(SaveManagedSolutionFormUseCase).execute(12, command),
    );
    const request = TestBed.inject(HttpTestingController).expectOne(
      "https://local.test/programs/12/management/solution-form/",
    );
    request.flush(
      {
        code: "form_revision_conflict",
        detail: "Форма изменилась",
        errors: [],
        meta: { current_form_revision: "b".repeat(64) },
      },
      { status: 409, statusText: "Conflict" },
    );
    expect((await result).ok).toBe(false);
    TestBed.inject(HttpTestingController).expectNone(
      "https://local.test/programs/12/management/solution-form/",
    );
  });
});
