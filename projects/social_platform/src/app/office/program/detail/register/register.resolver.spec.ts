/** @format */

import { TestBed } from "@angular/core/testing";
import { ProgramRegisterResolver } from "./register.resolver";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";

describe("ProgramRegisterResolver", () => {
  const mockRoute = { params: { programId: 1 } } as unknown as ActivatedRouteSnapshot;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
    });
  });

  it("should be created", () => {
    const result = TestBed.runInInjectionContext(() =>
      ProgramRegisterResolver(mockRoute, {} as RouterStateSnapshot)
    );
    expect(result).toBeTruthy();
  });
});
