/** @format */
import { TestBed } from "@angular/core/testing";
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from "@angular/router";
import { of, throwError, Subject } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";
import { Title } from "@angular/platform-browser";
import { TokenService } from "@corelib";
import { LoginUseCase } from "@api/auth/use-cases/login.use-case";
import { ProfileInfoService } from "@api/profile/facades/profile-info.service";
import { ProgramRegistrationUseCase } from "@api/program/use-cases/program-registration.use-case";
import { PublicRegistrationComponent } from "./public-registration.component";
import { RegistrationPublic } from "@domain/program/program-registration.model";
import { InstanceInfoService } from "@api/instance/instance-info.service";
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
function setup(
  authenticated = false,
  overrides: Partial<RegistrationPublic> = {},
  options: { instance?: boolean; query?: Record<string, string> } = {},
) {
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
        ...overrides,
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
          queryParamMap: of(convertToParamMap(options.query ?? {})),
          fragment,
          snapshot: { queryParamMap: convertToParamMap(options.query ?? {}) },
        },
      },
      { provide: TokenService, useValue: tokens },
      { provide: LoginUseCase, useValue: login },
      { provide: ProfileInfoService, useValue: { invalidateProfile: vi.fn() } },
      {
        provide: InstanceInfoService,
        useValue: {
          enabled: () => options.instance === true,
          demoMode: () => false,
          programId: () => 42,
        },
      },
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
  const whiteLabel: Partial<RegistrationPublic> = {
    accountMode: "email_password",
    branding: { name: "Чемпионат клиента", logoUrl: "https://client.example.test/logo.svg" },
  };
  it("показывает бренд клиента и скрывает поля профиля в короткой форме", () => {
    const { fixture, component } = setup(false, whiteLabel);
    const page = fixture.nativeElement as HTMLElement;
    expect(page.querySelector('[formControlName="firstName"]')).toBeNull();
    expect(page.querySelector('[formControlName="lastName"]')).toBeNull();
    expect(page.querySelector('[formControlName="birthday"]')).toBeNull();
    expect(page.querySelector("img")?.getAttribute("src")).toBe(whiteLabel.branding?.logoUrl);
    expect(page.textContent).not.toContain("PROCOLLAB");
    expect(TestBed.inject(Title).getTitle()).toBe("Кейс-чемпионат | Чемпионат клиента");
    component.changeMode("login");
    fixture.detectChanges();
    expect(page.querySelector("h1")?.textContent).toContain("Вход в Чемпионат клиента");
  });
  it("отправляет почту, пароль и согласия без пустой даты рождения и ФИО", () => {
    const { component, api } = setup(false, whiteLabel);
    component.answers.controls[field.id].setValue("Москва");
    const credentials = {
      email: "test@example.test",
      password: "Secret-pass-2030",
      repeatPassword: "Secret-pass-2030",
      acceptPolicy: true,
      acceptAge: true,
    };
    component.account.patchValue(credentials);
    component.submit();
    expect(api.submit).toHaveBeenCalledWith(
      42,
      { version: 3, answers: { [field.id]: "Москва" }, ...credentials },
      true,
    );
    expect(component.mode()).toBe("sent");
  });
  it("в короткой форме сохраняет требования к согласиям, паролю и ответам анкеты", () => {
    const { component, api } = setup(false, whiteLabel);
    component.account.patchValue({ email: "test@example.test", password: "short" });
    component.submit();
    expect(api.submit).not.toHaveBeenCalled();
    expect(component.account.controls.password.invalid).toBe(true);
    expect(component.account.controls.acceptPolicy.invalid).toBe(true);
    expect(component.account.controls.acceptAge.invalid).toBe(true);
    expect(component.answers.invalid).toBe(true);
  });
  it("возвращает полные требования при загрузке обычной программы", () => {
    const { component, api, fixture } = setup(false, whiteLabel);
    api.publicForm.mockReturnValue(
      of({
        id: 42,
        name: "Обычная программа",
        version: 3,
        fields: [],
        closed: false,
        enrolled: false,
        authenticated: false,
      }),
    );
    component.load();
    fixture.detectChanges();
    expect(component.account.controls.firstName.invalid).toBe(true);
    expect(component.account.controls.lastName.invalid).toBe(true);
    expect(component.account.controls.birthday.invalid).toBe(true);
    expect(fixture.nativeElement.querySelector('[formControlName="birthday"]')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain("Аккаунт PROCOLLAB");
  });
  it("использует название клиента, когда логотип не настроен", () => {
    const { fixture } = setup(false, {
      ...whiteLabel,
      branding: { name: "Чемпионат клиента", logoUrl: "" },
    });
    expect(fixture.nativeElement.querySelector("img")).toBeNull();
    expect(fixture.nativeElement.textContent).toContain("Чемпионат клиента");
    expect(fixture.nativeElement.textContent).not.toContain("PROCOLLAB");
  });
  it("не показывает пустой раздел анкеты в короткой форме", () => {
    const { fixture } = setup(false, { ...whiteLabel, fields: [] });
    expect(fixture.nativeElement.textContent).not.toContain("Анкета участника");
    expect(fixture.nativeElement.querySelector('[formControlName="acceptPolicy"]')).toBeTruthy();
  });
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
  it.each([false, true])(
    "после входа в экземпляре сразу открывает программу, enrolled=%s",
    enrolled => {
      const { component, api, login, tokens } = setup(false, { enrolled }, { instance: true });
      const navigate = vi.spyOn(TestBed.inject(Router), "navigateByUrl").mockResolvedValue(true);
      const credentials = { email: "test@example.test", password: "Secret-pass-2030" };
      const session = { access: "test-access", refresh: "test-refresh" };
      login.execute.mockReturnValue(of({ ok: true, value: { tokens: session } }));
      component.credentials.setValue(credentials);
      component.signIn();
      expect(login.execute).toHaveBeenCalledWith(credentials);
      expect(tokens.memTokens).toHaveBeenCalledWith(session);
      expect(navigate).toHaveBeenCalledWith("/office/program/42");
      expect(component.credentials.controls.password.value).toBe("");
      expect(api.submit).not.toHaveBeenCalled();
      expect(api.publicForm).toHaveBeenCalledTimes(1);
    },
  );
  it.each([
    [
      "/office/program/42/management/settings?tab=criteria#weights",
      "/office/program/42/management/settings?tab=criteria#weights",
    ],
    ["https://other.example.test/office", "/office/program/42"],
    ["//other.example.test/office", "/office/program/42"],
  ])("сохраняет только безопасный маршрут после входа: %s", (returnUrl, expected) => {
    const { component, login } = setup(false, {}, { instance: true, query: { returnUrl } });
    const navigate = vi.spyOn(TestBed.inject(Router), "navigateByUrl").mockResolvedValue(true);
    login.execute.mockReturnValue(
      of({ ok: true, value: { tokens: { access: "test-access", refresh: "test-refresh" } } }),
    );
    component.credentials.setValue({ email: "test@example.test", password: "Secret-pass-2030" });
    component.signIn();
    expect(navigate).toHaveBeenCalledWith(expected);
  });
  it("сохраняет заполнение анкеты после входа в обычную программу", () => {
    const { component, login, api } = setup();
    const navigate = vi.spyOn(TestBed.inject(Router), "navigateByUrl").mockResolvedValue(true);
    login.execute.mockReturnValue(
      of({ ok: true, value: { tokens: { access: "test-access", refresh: "test-refresh" } } }),
    );
    component.changeMode("login");
    component.credentials.setValue({ email: "test@example.test", password: "Secret-pass-2030" });
    component.signIn();
    expect(navigate).not.toHaveBeenCalled();
    expect(component.mode()).toBe("form");
    expect(api.publicForm).toHaveBeenCalledTimes(2);
  });
  it("открывает восстановление по ссылке", () => {
    const { component } = setup(false, {}, { query: { mode: "reset" } });
    expect(component.mode()).toBe("reset");
  });
  it("открывает подтверждение, даже если ссылка содержит режим восстановления", () => {
    const { component } = setup(false, {}, { query: { mode: "reset", confirmation: "proof" } });
    expect(component.mode()).toBe("confirm");
    expect(component.confirmToken()).toBe("proof");
  });
  it("оставляет ошибку входа на той же форме без перехода", () => {
    const { component, login, tokens } = setup(false, {}, { instance: true });
    const navigate = vi.spyOn(TestBed.inject(Router), "navigateByUrl").mockResolvedValue(true);
    login.execute.mockReturnValue(of({ ok: false, error: "invalid" }));
    component.changeMode("login");
    component.credentials.setValue({ email: "test@example.test", password: "Secret-pass-2030" });
    component.signIn();
    expect(navigate).not.toHaveBeenCalled();
    expect(tokens.memTokens).not.toHaveBeenCalled();
    expect(component.mode()).toBe("login");
    expect(component.error()).toContain("Не удалось войти");
    expect(component.busy()).toBe(false);
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
