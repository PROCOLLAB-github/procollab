/** @format */

import { TestBed } from "@angular/core/testing";

import { ProgramDetailResolver } from "./detail.resolver";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";

describe("ProgramDetailResolver", () => {
  const mockRoute = { params: { programId: 1 } } as unknown as ActivatedRouteSnapshot;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
  });

  it("should be created", () => {
    const result = TestBed.runInInjectionContext(() =>
      ProgramDetailResolver(mockRoute, {} as RouterStateSnapshot),
    );
    expect(result).toBeTruthy();
  });
});
