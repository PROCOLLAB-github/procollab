/** @format */
import { TestBed } from "@angular/core/testing";
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  convertToParamMap,
  provideRouter,
  RouterStateSnapshot,
  UrlTree,
} from "@angular/router";
import { InstanceInfoService } from "@api/instance/instance-info.service";
import { AUTH_ROUTES } from "./auth.routes";

function guard(path: string, enabled: boolean, query: Record<string, string> = {}) {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      {
        provide: InstanceInfoService,
        useValue: { enabled: () => enabled, registrationUrl: () => "/program-registration/42" },
      },
    ],
  });
  const route = AUTH_ROUTES[0].children!.find(route => route.path === path)!;
  const activate = route.canActivate![0] as CanActivateFn;
  return TestBed.runInInjectionContext(() =>
    activate(
      { queryParamMap: convertToParamMap(query) } as ActivatedRouteSnapshot,
      {} as RouterStateSnapshot,
    ),
  ) as UrlTree | boolean;
}

describe("Авторизация клиентского экземпляра", () => {
  it.each([
    ["login", "login"],
    ["reset_password/send_email", "reset"],
  ])("открывает клиентскую форму вместо общей страницы %s", (path, mode) => {
    const result = guard(path, true) as UrlTree;
    expect(result.root.children["primary"].segments.map(segment => segment.path)).toEqual([
      "program-registration",
      "42",
    ]);
    expect(result.queryParams).toEqual({ mode });
  });
  it("сохраняет безопасную ссылку на защищенную страницу", () => {
    const returnUrl = "/office/program/42/management/settings?tab=criteria#weights";
    expect((guard("login", true, { returnUrl }) as UrlTree).queryParams).toEqual({
      mode: "login",
      returnUrl,
    });
  });
  it.each(["https://other.example.test/", "//other.example.test", "/auth/login"])(
    "не переносит недопустимый returnUrl: %s",
    returnUrl => {
      expect((guard("login", true, { returnUrl }) as UrlTree).queryParams).toEqual({
        mode: "login",
      });
    },
  );
  it("регистрацию направляет на клиентскую форму", () => {
    expect((guard("register", true) as UrlTree).toString()).toBe("/program-registration/42");
  });
  it.each(["login", "register", "reset_password/send_email"])(
    "сохраняет общую страницу %s при выключенном клиентском режиме",
    path => expect(guard(path, false)).toBe(true),
  );
});
