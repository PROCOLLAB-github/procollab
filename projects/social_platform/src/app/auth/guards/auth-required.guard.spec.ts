/** @format */

import { TestBed } from "@angular/core/testing";

import { AuthRequiredGuard } from "./auth-required.guard";
import { RouterTestingModule } from "@angular/router/testing";
import { AuthService } from "../services";
import { of } from "rxjs";
import { ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";

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
      AuthRequiredGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
    expect(result).toBeTruthy();
  });
});
