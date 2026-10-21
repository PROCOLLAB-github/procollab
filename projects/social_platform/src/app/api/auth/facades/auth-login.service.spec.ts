/** @format */
import { TestBed } from "@angular/core/testing";
import { FormBuilder } from "@angular/forms";
import { signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { of } from "rxjs";
import { TokenService, ValidationService } from "@corelib";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { AuthLoginService } from "./auth-login.service";
import { AuthUIInfoService } from "./ui/auth-ui-info.service";
import { LoginUseCase } from "../use-cases/login.use-case";
import { ProfileInfoService } from "@api/profile/facades/profile-info.service";
import { initial } from "@domain/shared/async-state";

describe("Возврат к программе после входа", () => {
  function setup(queryParams: Record<string, string> = {}, ok = true) {
    const router = { navigateByUrl: vi.fn().mockResolvedValue(true) };
    const tokens = { memTokens: vi.fn() };
    const profile = {
      invalidateProfile: vi.fn(),
      invalidateLeaderProjects: vi.fn(),
      ensureProfileLoaded: vi.fn(),
    };
    const pair = { access: "local-access", refresh: "local-refresh" };
    const execute = vi.fn(() =>
      of(
        ok
          ? { ok: true, value: { tokens: pair } }
          : { ok: false, error: { kind: "wrong_credentials" } },
      ),
    );
    const ui = {
      loginForm: new FormBuilder().group({ email: "qa@example.test", password: "test-only" }),
      login$: signal(initial()),
      showPassword: signal(false),
    };
    TestBed.configureTestingModule({
      providers: [
        AuthLoginService,
        { provide: TokenService, useValue: tokens },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams } } },
        { provide: ValidationService, useValue: { getFormValidation: () => true } },
        { provide: AuthUIInfoService, useValue: ui },
        { provide: LoginUseCase, useValue: { execute } },
        { provide: ProfileInfoService, useValue: profile },
        { provide: LoggerService, useValue: { debug: vi.fn() } },
      ],
    });
    TestBed.inject(AuthLoginService).onSubmit();
    return { router, tokens, execute, profile, pair };
  }
  it("возвращает к исходному разделу и его query после успешного входа", () => {
    const url = "/office/program/7/management/projects?evaluation=evaluated&order=activity_desc";
    const { router, tokens, pair, profile } = setup({ returnUrl: url });
    expect(tokens.memTokens).toHaveBeenCalledWith(pair);
    expect(profile.invalidateProfile).toHaveBeenCalledOnce();
    expect(router.navigateByUrl).toHaveBeenCalledExactlyOnceWith(url);
  });
  it.each(["https://example.test/", "//example.test", "/auth/login", "/office/\\example.test"])(
    "внешний возврат %s заменяет существующим переходом",
    returnUrl => {
      expect(setup({ returnUrl, redirect: "program" }).router.navigateByUrl).toHaveBeenCalledWith(
        "/office/program",
      );
    },
  );
  it("сохраняет вход без returnUrl и legacy redirect=program", () => {
    expect(setup().router.navigateByUrl).toHaveBeenCalledWith("/office");
  });
  it("не переходит со страницы при неверном пароле", () => {
    const { router, tokens } = setup({ returnUrl: "/office/program/7" }, false);
    expect(router.navigateByUrl).not.toHaveBeenCalled();
    expect(tokens.memTokens).not.toHaveBeenCalled();
  });
});
