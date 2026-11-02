/** @format */

import { TestBed } from "@angular/core/testing";
import { signal } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { ActivatedRoute, convertToParamMap, Router } from "@angular/router";
import { of } from "rxjs";
import { ValidationService } from "@corelib";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { AsyncState, initial } from "@domain/shared/async-state";
import { fail, ok, Result } from "@domain/shared/result.type";
import { PasswordError } from "@domain/auth/results/password.result";
import { SetPasswordUseCase } from "../use-cases/set-password.use-case";
import { ResetPasswordUseCase } from "../use-cases/reset-password.use-case";
import { AuthUIInfoService } from "./ui/auth-ui-info.service";
import { AuthPasswordService } from "./auth-password.service";

describe("Установка нового пароля через фасад", () => {
  const password = "Pr517-unit-only-Aa1!";
  const token = "pr517-unit-only-reset-token";
  function setup(
    query: Record<string, string> = { token },
    result: Result<void, PasswordError> = ok(undefined),
  ) {
    const execute = vi.fn(() => of(result));
    const router = {
      navigate: vi.fn().mockResolvedValue(true),
      navigateByUrl: vi.fn().mockResolvedValue(true),
    };
    const logger = { error: vi.fn(), debug: vi.fn() };
    const ui = {
      passwordForm: new FormBuilder().group({ password, passwordRepeated: password }),
      resetForm: new FormBuilder().group({ email: "qa@example.test" }),
      password$: signal<AsyncState<void, PasswordError>>(initial()),
      credsSubmitInitiated: signal(false),
    };
    TestBed.configureTestingModule({
      providers: [
        AuthPasswordService,
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of(query),
            snapshot: { queryParamMap: convertToParamMap(query) },
          },
        },
        { provide: SetPasswordUseCase, useValue: { execute } },
        { provide: ResetPasswordUseCase, useValue: { execute: vi.fn() } },
        { provide: Router, useValue: router },
        { provide: ValidationService, useValue: { getFormValidation: () => true } },
        { provide: AuthUIInfoService, useValue: ui },
        { provide: LoggerService, useValue: logger },
      ],
    });
    return { service: TestBed.inject(AuthPasswordService), execute, ui, router, logger };
  }
  it("объясняет отсутствие ссылки до отправки пароля", () => {
    const { service, execute, ui } = setup({});
    service.init();
    service.onSubmitSetPassword();
    expect(execute).not.toHaveBeenCalled();
    expect(ui.password$()).toEqual({ status: "failure", error: { kind: "invalid_token" } });
  });
  it("при отказе сохраняет значения и не пишет пароль или токен в журнал", () => {
    const { service, execute, ui, router, logger } = setup(
      { token },
      fail({ kind: "invalid_token" }),
    );
    service.onSubmitSetPassword();
    expect(execute).toHaveBeenCalledExactlyOnceWith(password, token);
    expect(ui.passwordForm.value).toEqual({ password, passwordRepeated: password });
    expect(router.navigate).not.toHaveBeenCalled();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
    expect(JSON.stringify(logger.error.mock.calls)).not.toContain(password);
    expect(JSON.stringify(logger.error.mock.calls)).not.toContain(token);
  });
  it.each([
    ["registration_program", "49", "/program-registration", "49"],
    [
      "expert_invitation",
      "pr517-unit-expert-invitation-12345",
      "/expert-invitation",
      "pr517-unit-expert-invitation-12345",
    ],
    [
      "organizer_invitation",
      "pr517-unit-organizer-invitation-12345",
      "/organizer-invitation",
      "pr517-unit-organizer-invitation-12345",
    ],
  ])("после успеха сохраняет контекст %s и предлагает обычный вход", (key, value, route, id) => {
    const { service, router } = setup({ token, [key]: value });
    service.onSubmitSetPassword();
    expect(router.navigate).toHaveBeenCalledExactlyOnceWith([route, id], {
      queryParams: { mode: "login" },
    });
  });
  it("обычный сброс после успеха возвращает на форму входа", () => {
    const { service, router } = setup();
    service.onSubmitSetPassword();
    expect(router.navigateByUrl).toHaveBeenCalledExactlyOnceWith("/auth/login");
  });
});
