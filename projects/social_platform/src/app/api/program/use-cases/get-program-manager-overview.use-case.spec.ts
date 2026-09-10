/** @format */

import { HttpErrorResponse } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { ProgramAnalyticsOverview } from "@domain/program/program-analytics.model";
import { ProgramRepositoryPort } from "@domain/program/ports/program.repository.port";
import { firstValueFrom, of, throwError } from "rxjs";
import { GetProgramManagerOverviewUseCase } from "./get-program-manager-overview.use-case";

describe("GetProgramManagerOverviewUseCase", () => {
  const repository = { getManagerOverview: vi.fn() };
  let useCase: GetProgramManagerOverviewUseCase;

  beforeEach(() => {
    repository.getManagerOverview.mockReset();
    TestBed.configureTestingModule({
      providers: [
        GetProgramManagerOverviewUseCase,
        { provide: ProgramRepositoryPort, useValue: repository },
      ],
    });
    useCase = TestBed.inject(GetProgramManagerOverviewUseCase);
  });

  it("возвращает manager overview программы", async () => {
    const overview = { program: { id: 12, name: "Программа" } } as ProgramAnalyticsOverview;
    repository.getManagerOverview.mockReturnValue(of(overview));

    await expect(firstValueFrom(useCase.execute(12))).resolves.toEqual({
      ok: true,
      value: overview,
    });
  });

  it("сохраняет HTTP status для безопасного error state", async () => {
    repository.getManagerOverview.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 403 })),
    );

    await expect(firstValueFrom(useCase.execute(12))).resolves.toEqual({
      ok: false,
      error: { kind: "manager_overview_error", status: 403 },
    });
  });
});
