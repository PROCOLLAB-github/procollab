/** @format */

import { TestBed } from "@angular/core/testing";
import { ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { GetProgramUseCase } from "@api/program/use-cases/get-program.use-case";
import { ProgramDetailMainUIInfoService } from "@api/program/facades/detail/ui/program-detail-main-ui-info.service";
import { Program } from "@domain/program/program.model";
import { fail, ok } from "@domain/shared/result.type";
import { firstValueFrom, Observable, of } from "rxjs";
import { ProgramDetailResolver } from "./detail.resolver";

describe("ProgramDetailResolver", () => {
  const program = { ...Program.default(), id: 7 };
  let getProgram: { execute: ReturnType<typeof vi.fn> };
  let ui: ProgramDetailMainUIInfoService;

  beforeEach(() => {
    getProgram = { execute: vi.fn().mockReturnValue(of(ok(program))) };
    TestBed.configureTestingModule({
      providers: [
        ProgramDetailMainUIInfoService,
        { provide: GetProgramUseCase, useValue: getProgram },
      ],
    });
    ui = TestBed.inject(ProgramDetailMainUIInfoService);
  });

  function resolve(programId: unknown) {
    return firstValueFrom(
      TestBed.runInInjectionContext(() =>
        ProgramDetailResolver(
          { params: { programId } } as unknown as ActivatedRouteSnapshot,
          {} as RouterStateSnapshot,
        ),
      ) as Observable<Program>,
    );
  }

  it("converts the actual string route parameter to a number before the use case", async () => {
    expect(await resolve("7")).toBe(program);
    expect(getProgram.execute).toHaveBeenCalledExactlyOnceWith(7);
    expect(typeof getProgram.execute.mock.calls[0][0]).toBe("number");
    expect(ui.program()).toBe(program);
  });

  it.each(["abc", "NaN", "0", "-7", "1.5", "Infinity", "", undefined])(
    "invalid route %s uses the existing Program fallback without a request",
    async programId => {
      const result = await resolve(programId);
      expect(getProgram.execute).not.toHaveBeenCalled();
      expect(result).toBeInstanceOf(Program);
      expect(result).toEqual(new Program());
      expect(ui.program()).toBe(result);
      expect(ui.registeredProgramModal()).toBeFalsy();
    },
  );

  it("preserves the existing fallback on get_program_error", async () => {
    getProgram.execute.mockReturnValue(of(fail({ kind: "get_program_error" })));
    expect(await resolve("7")).toEqual(new Program());
    expect(getProgram.execute).toHaveBeenCalledExactlyOnceWith(7);
  });
});
