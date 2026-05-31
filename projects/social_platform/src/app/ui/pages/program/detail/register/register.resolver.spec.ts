/** @format */

import { TestBed } from "@angular/core/testing";
import { ProgramRegisterResolver } from "./register.resolver";
import { ActivatedRouteSnapshot, RouterStateSnapshot, provideRouter } from "@angular/router";
import { of } from "rxjs";
import { GetProgramDataSchemaUseCase } from "@api/program/use-cases/get-program-data-schema.use-case";

describe("ProgramRegisterResolver", () => {
  const mockRoute = { params: { programId: 1 } } as unknown as ActivatedRouteSnapshot;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: GetProgramDataSchemaUseCase,
          useValue: { execute: () => of({ ok: true, value: {} }) },
        },
      ],
    });
  });

  it("should be created", () => {
    const result = TestBed.runInInjectionContext(() =>
      ProgramRegisterResolver(mockRoute, {} as RouterStateSnapshot)
    );
    expect(result).toBeTruthy();
  });
});
