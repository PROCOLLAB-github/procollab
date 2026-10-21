/** @format */

import { TestBed } from "@angular/core/testing";

import { AuthRequiredGuard } from "./auth-required.guard";
import { RouterTestingModule } from "@angular/router/testing";
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from "@angular/router";
import { TokenService } from "../../services/tokens/token.service";

describe("AuthRequiredGuard", () => {
  beforeEach(() => {
    const tokenSpy = { getTokens: vi.fn() };
    tokenSpy.getTokens.mockReturnValue(null);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [{ provide: TokenService, useValue: tokenSpy }],
    });
  });

  it("should be created", () => {
    const result = TestBed.runInInjectionContext(() =>
      AuthRequiredGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
    expect(result).toBeTruthy();
  });
  it("сохраняет защищенный маршрут для возврата после входа", () => {
    const url = "/office/program/7/management/participants?order=activity_asc";
    const result = TestBed.runInInjectionContext(() =>
      AuthRequiredGuard({} as ActivatedRouteSnapshot, { url } as RouterStateSnapshot),
    ) as UrlTree;
    expect(result.queryParams["returnUrl"]).toBe(url);
  });
  it("наличие сессии сохраняет прежнее разрешение маршрута", () => {
    vi.mocked(TestBed.inject(TokenService).getTokens).mockReturnValue({
      access: "local-a",
      refresh: "local-r",
    });
    expect(
      TestBed.runInInjectionContext(() =>
        AuthRequiredGuard(
          {} as ActivatedRouteSnapshot,
          { url: "/office/program/7" } as RouterStateSnapshot,
        ),
      ),
    ).toBe(true);
  });
});
