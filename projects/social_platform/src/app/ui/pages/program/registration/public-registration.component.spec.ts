/** @format */
import { TestBed } from "@angular/core/testing";
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from "@angular/router";
import { of, throwError, Subject } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";
import { TokenService } from "@corelib";
import { LoginUseCase } from "@api/auth/use-cases/login.use-case";
import { ProfileInfoService } from "@api/profile/facades/profile-info.service";
import { ProgramRegistrationUseCase } from "@api/program/use-cases/program-registration.use-case";
import { RegistrationPublic } from "@domain/program/program-registration.model";
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
function setup(authenticated = false, resume?: RegistrationPublic["resume"]) {
  const fragmentChanges = new Subject<string | null>();
  const snapshot = {
    paramMap: convertToParamMap({ id: "42" }),
    queryParamMap: convertToParamMap({}),
    fragment: null as string | null,
  };
  const openLink = (fragment: string) => {
    snapshot.fragment = fragment;
    fragmentChanges.next(fragment);
  };
  sessionStorage.clear();
  localStorage.removeItem("program-registration-42-browser-proof");
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
        resume,
      }),
    ),
    submit: vi.fn(() =>
      of({ receipt: "opaque", browserProof: "browser-proof", email: "test@example.test" }),
    ),
    tokenAction: vi
      .fn<ProgramRegistrationUseCase["tokenAction"]>()
      .mockReturnValue(of({ confirmationRequired: true })),
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
          fragment: fragmentChanges,
          snapshot,
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
  return { fixture, component: fixture.componentInstance, api, tokens, login, openLink };
}
describe("Публичная регистрация участника", () => {
  it("при открытии ссылки без доказательства проверяет состояние и требует явного подтверждения", () => {
    const { component, openLink, api, tokens } = setup();
    openLink("confirmation=email-proof");
    openLink("confirmation=email-proof");
    expect(component.mode()).toBe("confirm");
    expect(api.tokenAction).toHaveBeenCalledExactlyOnceWith(42, "confirm", "email-proof", {
      linkOpened: true,
    });
    expect(api.publicForm).toHaveBeenCalledTimes(1);
    expect(tokens.memTokens).not.toHaveBeenCalled();
  });

  it("при открытии ссылки в браузере регистрации подтверждает почту автоматически", () => {
    const { component, api, openLink, tokens } = setup();
    const navigate = vi.spyOn(TestBed.inject(Router), "navigateByUrl").mockResolvedValue(true);
    localStorage.setItem(
      "program-registration-42-browser-proof",
      JSON.stringify({ proof: "browser-proof", expiresAt: Date.now() + 60_000 }),
    );
    api.tokenAction.mockReturnValue(
      of({ access: "test-access", refresh: "test-refresh", enrolled: true }),
    );
    openLink("confirmation=email-proof");
    expect(api.tokenAction).toHaveBeenCalledExactlyOnceWith(42, "confirm", "email-proof", {
      linkOpened: true,
      browserProof: "browser-proof",
    });
    expect(tokens.memTokens).toHaveBeenCalledWith({
      access: "test-access",
      refresh: "test-refresh",
    });
    expect(navigate).toHaveBeenCalledWith("/office/program/42", { replaceUrl: true });
    expect(localStorage.getItem("program-registration-42-browser-proof")).toBeNull();
  });

  it("для использованной ссылки показывает подтверждение без ошибки или повторной отправки", () => {
    const { fixture, component, api, openLink, tokens } = setup();
    api.tokenAction.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 409,
            error: { code: "confirmation_used" },
          }),
      ),
    );
    openLink("confirmation=used-proof");
    fixture.detectChanges();
    expect(component.mode()).toBe("confirmed");
    expect(fixture.nativeElement.textContent).toContain("Почта уже подтверждена.");
    expect(fixture.nativeElement.textContent).not.toContain("Отправить письмо еще раз");
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
    expect(tokens.memTokens).not.toHaveBeenCalled();
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
  it("при отправке пустой формы связывает поля аккаунта с их ошибками", () => {
    const { fixture, component, api } = setup();
    const root: HTMLElement = fixture.nativeElement;

    expect(root.querySelector("input[aria-invalid]")).toBeNull();
    root
      .querySelector("form.enrollment__form")!
      .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(api.submit).not.toHaveBeenCalled();
    expect(component.error()).toBe("Заполните обязательные поля и подтвердите согласия.");
    const messages = {
      firstName: "Введите имя.",
      lastName: "Введите фамилию.",
      email: "Введите email.",
      birthday: "Укажите дату рождения.",
      password: "Введите пароль.",
      repeatPassword: "Повторите пароль.",
    };
    for (const [name, message] of Object.entries(messages)) {
      const input = root.querySelector<HTMLInputElement>(`input[formControlName="${name}"]`)!;
      expect(input.labels).toHaveLength(1);
      expect(input.getAttribute("aria-invalid")).toBe("true");
      const errorId = input.getAttribute("aria-describedby");
      expect(root.querySelector(`#${errorId}`)?.textContent?.trim()).toBe(message);
    }
  });

  it("показывает ошибки после ухода с поля и снимает их при исправлении", () => {
    const { fixture } = setup();
    const root: HTMLElement = fixture.nativeElement;
    const email = root.querySelector<HTMLInputElement>("#enrollment-email")!;
    const password = root.querySelector<HTMLInputElement>("#enrollment-password")!;
    const repeatPassword = root.querySelector<HTMLInputElement>("#enrollment-repeat-password")!;
    const enter = (input: HTMLInputElement, value: string) => {
      input.value = value;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      fixture.detectChanges();
    };
    const blur = (input: HTMLInputElement) => {
      input.dispatchEvent(new Event("blur"));
      fixture.detectChanges();
    };

    enter(email, "test");
    expect(email.hasAttribute("aria-invalid")).toBe(false);
    blur(email);
    expect(root.querySelector("#enrollment-email-error")?.textContent?.trim()).toBe(
      "Введите корректный email.",
    );
    enter(email, "test@example.test");
    expect(email.hasAttribute("aria-describedby")).toBe(false);
    expect(root.querySelector("#enrollment-email-error")).toBeNull();

    enter(password, "short");
    blur(password);
    expect(password.getAttribute("aria-invalid")).toBe("true");
    expect(root.querySelector("#enrollment-password-hint")?.textContent?.trim()).toBe(
      "Не менее 8 символов",
    );
    enter(password, "valid-password");
    expect(password.hasAttribute("aria-invalid")).toBe(false);

    enter(repeatPassword, "other-password");
    expect(repeatPassword.hasAttribute("aria-invalid")).toBe(false);
    blur(repeatPassword);
    expect(repeatPassword.getAttribute("aria-invalid")).toBe("true");
    expect(root.querySelector("#enrollment-repeat-error")?.textContent?.trim()).toBe(
      "Пароли не совпадают.",
    );
    enter(password, "other-password");
    expect(repeatPassword.hasAttribute("aria-invalid")).toBe(false);
    expect(repeatPassword.hasAttribute("aria-describedby")).toBe(false);
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
    expect(JSON.stringify(localStorage)).not.toContain("Secret-pass-2030");
    expect(localStorage.getItem("program-registration-42-browser-proof")).toContain(
      "browser-proof",
    );
  });
  it("сохраняет ответы при переходе ко входу", () => {
    const { component } = setup();
    component.answers.controls[field.id].setValue("Москва");
    component.changeMode("login");
    expect(component.answers.getRawValue()[field.id]).toBe("Москва");
  });
  it("восстанавливает ответы владельца и не переносит их в форму другого аккаунта", () => {
    const { component, api } = setup(true, {
      draftId: "owner-draft",
      answers: { [field.id]: "Москва" },
    });
    expect(component.answers.getRawValue()[field.id]).toBe("Москва");

    const program = component.program()!;
    api.publicForm.mockReturnValue(of({ ...program, resume: undefined }));
    component.load();
    expect(component.answers.getRawValue()[field.id]).toBe("");
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
  it("переводит на программу после ручного подтверждения", () => {
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
    expect(navigate).toHaveBeenCalledWith("/office/program/42", { replaceUrl: true });
  });
});
