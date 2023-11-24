/** @format */

import { TestBed } from "@angular/core/testing";
import { ProjectEditResolver } from "./edit.resolver";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { of } from "rxjs";
import { AuthService } from "@auth/services";
import { ActivatedRouteSnapshot, convertToParamMap, RouterStateSnapshot } from "@angular/router";

describe("ProjectEditResolver", () => {
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
      ProjectEditResolver(mockRoute, {} as RouterStateSnapshot)
    );
    expect(result).toBeTruthy();
  });
});
