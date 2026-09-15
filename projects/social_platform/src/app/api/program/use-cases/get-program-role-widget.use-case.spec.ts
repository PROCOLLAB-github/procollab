/** @format */

import { TestBed } from "@angular/core/testing";
import { HttpErrorResponse } from "@angular/common/http";
import { of, throwError } from "rxjs";
import { describe, expect, it, vi } from "vitest";
import { ProgramRepositoryPort } from "@domain/program/ports/program.repository.port";
import { GetProgramRoleWidgetUseCase } from "./get-program-role-widget.use-case";

describe("GetProgramRoleWidgetUseCase", () => {
  it.each([
    [0, "network"],
    [500, "network"],
    [401, "unauthorized"],
    [403, "forbidden"],
    [404, "not_found"],
    [409, "integrity"],
  ])("maps status %i without leaking body", (status, kind) => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ProgramRepositoryPort,
          useValue: {
            getRoleWidget: () =>
              throwError(
                () =>
                  new HttpErrorResponse({ status: Number(status), error: { secret: "raw body" } }),
              ),
          },
        },
      ],
    });
    TestBed.inject(GetProgramRoleWidgetUseCase)
      .execute(12)
      .subscribe(result => expect(result).toEqual({ ok: false, error: kind }));
  });
  it("uses the narrow endpoint port, never the manager API", () => {
    const repository = {
      getRoleWidget: vi.fn(() => of({ programId: 12, role: "expert" })),
      getManagerOverview: vi.fn(),
    };
    TestBed.configureTestingModule({
      providers: [{ provide: ProgramRepositoryPort, useValue: repository }],
    });
    TestBed.inject(GetProgramRoleWidgetUseCase).execute(12).subscribe();
    expect(repository.getRoleWidget).toHaveBeenCalledWith(12);
    expect(repository.getManagerOverview).not.toHaveBeenCalled();
  });
});
