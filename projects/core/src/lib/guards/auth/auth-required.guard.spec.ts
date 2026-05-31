/** @format */

import { TestBed } from "@angular/core/testing";

import { AuthRequiredGuard } from "./auth-required.guard";
import { RouterTestingModule } from "@angular/router/testing";
import { ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { TokenService } from "../../services/tokens/token.service";

describe("AuthRequiredGuard", () => {
  beforeEach(() => {
    const tokenSpy = jasmine.createSpyObj("TokenService", ["getTokens"]);
    tokenSpy.getTokens.and.returnValue(null);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [{ provide: TokenService, useValue: tokenSpy }],
    });
  });

  it("should be created", () => {
    const result = TestBed.runInInjectionContext(() =>
      AuthRequiredGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );
    expect(result).toBeTruthy();
  });
});
