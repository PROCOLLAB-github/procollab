/** @format */

import { TestBed } from "@angular/core/testing";

import { AuthRequiredGuard } from "./auth-required.guard";
import { RouterTestingModule } from "@angular/router/testing";
import { of } from "rxjs";
import { ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { AuthService } from "projects/social_platform/src/app/api/auth";

describe("AuthRequiredGuard", () => {
  beforeEach(() => {
    const authSpy = jasmine.createSpyObj("AuthService", { getTokens: {}, getProfile: of({}) });

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [{ provide: AuthService, useValue: authSpy }],
    });
  });

  it("should be created", () => {
    const result = TestBed.runInInjectionContext(() =>
      AuthRequiredGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );
    expect(result).toBeTruthy();
  });
});
