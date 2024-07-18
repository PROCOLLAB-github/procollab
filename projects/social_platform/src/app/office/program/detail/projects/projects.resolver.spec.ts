/** @format */

import { TestBed } from "@angular/core/testing";

import { ProgramProjectsResolver } from "./projects.resolver";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";

describe("ProgramProjectsResolver", () => {
  const mockRoute = { parent: { params: { programId: 1 } } } as unknown as ActivatedRouteSnapshot;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
  });

  it("should be created", () => {
    const result = TestBed.runInInjectionContext(() =>
      ProgramProjectsResolver(mockRoute, {} as RouterStateSnapshot),
    );
    expect(result).toBeTruthy();
  });
});
