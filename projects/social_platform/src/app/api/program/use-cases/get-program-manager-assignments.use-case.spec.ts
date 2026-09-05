/** @format */
import { HttpErrorResponse } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { ProgramRepositoryPort } from "@domain/program/ports/program.repository.port";
import { firstValueFrom, of, throwError } from "rxjs";
import { assignment, scoreDetail } from "@domain/program/program-analytics-assignment.fixture";
import { GetProgramManagerAssignmentsUseCase } from "./get-program-manager-assignments.use-case";
import { GetProgramManagerAssignmentScoresUseCase } from "./get-program-manager-assignment-scores.use-case";

describe("Manager drilldown use cases", () => {
  const repository = { getManagerAssignments: vi.fn(), getManagerAssignmentScores: vi.fn() };
  beforeEach(() => {
    vi.resetAllMocks();
    TestBed.configureTestingModule({
      providers: [{ provide: ProgramRepositoryPort, useValue: repository }],
    });
  });

  it("возвращает Result и не преобразует данные критериев", async () => {
    const list = [assignment()];
    const detail = scoreDetail();
    repository.getManagerAssignments.mockReturnValue(of(list));
    repository.getManagerAssignmentScores.mockReturnValue(of(detail));
    expect(
      await firstValueFrom(
        TestBed.inject(GetProgramManagerAssignmentsUseCase).execute(12, "completed"),
      ),
    ).toEqual({ ok: true, value: list });
    expect(
      await firstValueFrom(
        TestBed.inject(GetProgramManagerAssignmentScoresUseCase).execute(12, 17),
      ),
    ).toEqual({ ok: true, value: detail });
    expect(repository.getManagerAssignments).toHaveBeenCalledWith(12, "completed");
    expect(repository.getManagerAssignmentScores).toHaveBeenCalledWith(12, 17);
  });

  it.each([
    [401, "unauthorized"],
    [403, "forbidden"],
    [404, "not_found"],
    [500, "network"],
    [0, "network"],
  ])("status %s -> только domain error %s", async (status, kind) => {
    const response = throwError(
      () => new HttpErrorResponse({ status: Number(status), error: "private backend text" }),
    );
    repository.getManagerAssignments.mockReturnValue(response);
    repository.getManagerAssignmentScores.mockReturnValue(response);
    for (const result of [
      await firstValueFrom(TestBed.inject(GetProgramManagerAssignmentsUseCase).execute(12, "all")),
      await firstValueFrom(
        TestBed.inject(GetProgramManagerAssignmentScoresUseCase).execute(12, 17),
      ),
    ]) {
      expect(result).toEqual({ ok: false, error: { kind } });
      expect(JSON.stringify(result)).not.toContain("private backend text");
    }
  });
});
