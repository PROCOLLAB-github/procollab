/** @format */

import { HttpErrorResponse } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { ProjectRepositoryPort } from "@domain/project/ports/project.repository.port";
import { firstValueFrom, of, throwError } from "rxjs";
import { ResetProjectCoverUseCase } from "./reset-project-cover.use-case";

describe("ResetProjectCoverUseCase", () => {
  let reset: ReturnType<typeof vi.fn>;
  let useCase: ResetProjectCoverUseCase;
  beforeEach(() => {
    reset = vi.fn();
    TestBed.configureTestingModule({
      providers: [{ provide: ProjectRepositoryPort, useValue: { resetCover: reset } }],
    });
    useCase = TestBed.inject(ResetProjectCoverUseCase);
  });

  it.each([NaN, 0, -1, Infinity, 1.5])("не отправляет неверный id %s", async id => {
    expect(await firstValueFrom(useCase.execute(id))).toEqual({ ok: false, error: "failed" });
    expect(reset).not.toHaveBeenCalled();
  });

  it("возвращает фактическую обложку из API", async () => {
    const value = { coverImageAddress: "https://files.test/default.png", isDefaultCover: true };
    reset.mockReturnValue(of(value));
    expect(await firstValueFrom(useCase.execute(31))).toEqual({ ok: true, value });
  });

  it.each([
    { coverImageAddress: "", isDefaultCover: true },
    { coverImageAddress: "custom", isDefaultCover: false },
  ])("не принимает некорректный успех %s", async value => {
    reset.mockReturnValue(of(value));
    expect(await firstValueFrom(useCase.execute(31))).toEqual({ ok: false, error: "failed" });
  });

  it.each([
    [409, "unavailable"],
    [403, "forbidden"],
    [401, "forbidden"],
    [500, "failed"],
    [0, "failed"],
  ])("отображает безопасную ошибку HTTP %s", async (status, expected) => {
    reset.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: Number(status),
            error: { code: "default_cover_unavailable", detail: "private body" },
          }),
      ),
    );
    expect(await firstValueFrom(useCase.execute(31))).toEqual({ ok: false, error: expected });
  });
});
