/** @format */

import { TestBed } from "@angular/core/testing";
import { ProjectDetailResolver } from "./detail.resolver";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ActivatedRouteSnapshot, convertToParamMap, RouterStateSnapshot } from "@angular/router";

describe("ProjectDetailResolver", () => {
  const mockRoute = {
    paramMap: convertToParamMap({ projectId: 1 }),
  } as unknown as ActivatedRouteSnapshot;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
  });

  it("should be created", () => {
    const result = TestBed.runInInjectionContext(() =>
      ProjectDetailResolver(mockRoute, {} as RouterStateSnapshot),
    );
    expect(result).toBeTruthy();
  });
});
