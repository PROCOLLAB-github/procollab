/** @format */
import { TestBed } from "@angular/core/testing";
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from "@angular/router";
import { of, throwError, Subject } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";
import { TokenService } from "@corelib";
import { LoginUseCase } from "@api/auth/use-cases/login.use-case";
import { ProfileInfoService } from "@api/profile/facades/profile-info.service";
import { ProgramRegistrationUseCase } from "@api/program/use-cases/program-registration.use-case";
import { PublicRegistrationComponent } from "./public-registration.component";
const field = {
  id: "f" + "a".repeat(32),
  label: "Город",
  type: "text",
  helpText: "",
  required: true,
  source: "own",
  options: [],
  allowOther: false,
};
function setup(authenticated = false) {
  const fragment = new Subject<string | null>();
  sessionStorage.clear();
  const api = {
    publicForm: vi.fn(() =>
      of({
        id: 42,
        name: "Кейс-чемпионат",
        version: 3,
        fields: [field],
        closed: false,
        enrolled: false,
        authenticated,
      }),
    ),
    submit: vi.fn(() => of({ receipt: "opaque", email: "test@example.test" })),
    tokenAction: vi.fn(),
    resetPassword: vi.fn(),
  };
  const tokens = { getTokens: vi.fn(() => null), memTokens: vi.fn() };
  const login = { execute: vi.fn() };
  TestBed.configureTestingModule({
    imports: [PublicRegistrationComponent],
    providers: [
      provideRouter([]),
      {
        provide: ActivatedRoute,
        useValue: {
          paramMap: of(convertToParamMap({ id: "42" })),
          queryParamMap: of(convertToParamMap({})),
          fragment,
          snapshot: { queryParamMap: convertToParamMap({}) },
        },
      },
      { provide: TokenService, useValue: tokens },
      { provide: LoginUseCase, useValue: login },
      { provide: ProfileInfoService, useValue: { invalidateProfile: vi.fn() } },
    ],
  });
  TestBed.overrideComponent(PublicRegistrationComponent, {
    set: { providers: [{ provide: ProgramRegistrationUseCase, useValue: api }] },
  });
  const fixture = TestBed.createComponent(PublicRegistrationComponent);
  fixture.detectChanges();
  return { fixture, component: fixture.componentInstance, api, tokens, login, fragment };
}
describe("Публичная регистрация участника", () => {
  it("открывает подтверждение по fragment без повторной загрузки той же страницы", () => {
    const { component, fragment, api } = setup();
    component.mode.set("sent");
    fragment.next("confirmation=email-proof");
    expect(component.mode()).toBe("confirm");
    expect(component.confirmToken()).toBe("email-proof");
    expect(api.publicForm).toHaveBeenCalledTimes(1);
  });
  it("нативная отправка формы запускает регистрацию", () => {
    const { fixture, component, api } = setup(true);
    component.answers.controls[field.id].setValue("Москва");
    fixture.detectChanges();
    fixture.nativeElement
      .querySelector("form.enrollment__form")
      .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    expect(api.submit).toHaveBeenCalledWith(
      42,
      { version: 3, answers: { [field.id]: "Москва" } },
      false,
    );
  });
  it("отправляет только анкету вошедшего пользователя", () => {
    const { component, api } = setup(true);
    component.answers.controls[field.id].setValue("Москва");
    component.submit();
    expect(api.submit).toHaveBeenCalledWith(
      42,
      { version: 3, answers: { [field.id]: "Москва" } },
      false,
    );
  });
  it("не отправляет незаполненные обязательные поля", () => {
    const { component, api } = setup(true);
    component.submit();
    expect(api.submit).not.toHaveBeenCalled();
    expect(component.error()).toBe("Заполните обязательные поля анкеты.");
  });
  it("напоминает о согласиях только при создании аккаунта", () => {
    const { component, api } = setup();
    component.submit();
    expect(api.submit).not.toHaveBeenCalled();
    expect(component.error()).toBe("Заполните обязательные поля и подтвердите согласия.");
  });
  it("не сохраняет пароль в браузере после регистрации", () => {
    const { component } = setup();
    component.answers.controls[field.id].setValue("Москва");
    component.account.setValue({
      firstName: "Анна",
      lastName: "Иванова",
      email: "test@example.test",
      birthday: "2000-01-01",
      password: "Secret-pass-2030",
      repeatPassword: "Secret-pass-2030",
      acceptPolicy: true,
      acceptAge: true,
    });
    component.submit();
    expect(component.mode()).toBe("sent");
    expect(component.account.controls.password.value).toBe("");
    expect(JSON.stringify(sessionStorage)).not.toContain("Secret-pass-2030");
  });
  it("сохраняет ответы при переходе ко входу", () => {
    const { component } = setup();
    component.answers.controls[field.id].setValue("Москва");
    component.changeMode("login");
    expect(component.answers.getRawValue()[field.id]).toBe("Москва");
  });
  it("не выдает локальную сессию на основе ошибки подтверждения", () => {
    const { component, api, tokens } = setup();
    component.confirmToken.set("expired");
    api.tokenAction.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 409,
            error: { code: "confirmation_expired", detail: "Ссылка истекла" },
          }),
      ),
    );
    component.confirm();
    expect(component.mode()).toBe("expired");
    expect(tokens.memTokens).not.toHaveBeenCalled();
  });
  it("переводит на программу после успешного подтверждения", () => {
    const { component, api, tokens } = setup();
    const navigate = vi.spyOn(TestBed.inject(Router), "navigateByUrl").mockResolvedValue(true);
    vi.spyOn(TestBed.inject(Router), "navigate").mockResolvedValue(true);
    component.confirmToken.set("proof");
    api.tokenAction.mockReturnValue(
      of({ access: "test-access", refresh: "test-refresh", enrolled: true }),
    );
    component.confirm();
    expect(tokens.memTokens).toHaveBeenCalledWith({
      access: "test-access",
      refresh: "test-refresh",
    });
    expect(navigate).toHaveBeenCalledWith("/office/program/42");
  });
});
