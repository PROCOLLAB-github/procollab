/** @format */

import { TestBed } from "@angular/core/testing";

import { ProfileDetailResolver } from "./profile-detail.resolver";
import { AuthService } from "@auth/services";
import { ActivatedRouteSnapshot, convertToParamMap, RouterStateSnapshot } from "@angular/router";
import { of } from "rxjs";

describe("ProfileDetailResolver", () => {
  const mockRoute = { paramMap: convertToParamMap({ id: 1 }) } as unknown as ActivatedRouteSnapshot;
  beforeEach(() => {
    const authSpy = jasmine.createSpyObj("authService", { getUser: of({}) });

    TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: authSpy }],
    });
  });

  it("should be created", () => {
    const result = TestBed.runInInjectionContext(() =>
      ProfileDetailResolver(mockRoute, {} as RouterStateSnapshot)
    );
    expect(result).toBeTruthy();
  });
});
