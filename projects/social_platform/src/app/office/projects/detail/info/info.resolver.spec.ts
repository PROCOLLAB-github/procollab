/** @format */

import { TestBed } from "@angular/core/testing";

import { ProjectInfoResolver } from "./info.resolver";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { of } from "rxjs";
import { AuthService } from "@auth/services";
import { ActivatedRouteSnapshot, convertToParamMap, RouterStateSnapshot } from "@angular/router";

describe("ProjectInfoResolver", () => {
  const mockRoute = {
    paramMap: convertToParamMap({ projectId: 1 }),
  } as unknown as ActivatedRouteSnapshot;
  beforeEach(() => {
    const authSpy = {
      profile: of({}),
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: AuthService, useValue: authSpy }],
    });
  });

  it("should be created", () => {
    const result = TestBed.runInInjectionContext(() =>
      ProjectInfoResolver(mockRoute, {} as RouterStateSnapshot),
    );
    expect(result).toBeTruthy();
  });
});
