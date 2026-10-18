/** @format */

import { TestBed } from "@angular/core/testing";
import { ActivatedRoute, convertToParamMap, provideRouter } from "@angular/router";
import { of, throwError } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";
import { TokenService } from "@corelib";
import { EvaluationUseCase } from "@api/program/use-cases/evaluation.use-case";
import { LoginUseCase } from "@api/auth/use-cases/login.use-case";
import { ProfileInfoService } from "@api/profile/facades/profile-info.service";
import { ExpertInvitationComponent } from "./expert-invitation.component";

describe("Путь приглашённого эксперта", () => {
  it("не передаёт ссылку приглашения в Referer и восстанавливает политику после ухода", () => {
    const { fixture } = setup();
    expect(document.querySelector('meta[name="referrer"]')?.getAttribute("content")).toBe(
      "no-referrer",
    );
    fixture.destroy();
    expect(document.querySelector('meta[name="referrer"]')).toBeNull();
  });
  it("вход через форму предотвращает перезагрузку и вызывает авторизацию", () => {
    const { fixture, component, login } = setup();
    component.changeMode("login");
    component.password.setValue("password");
    fixture.detectChanges();
    const form = fixture.nativeElement.querySelector("form") as HTMLFormElement;
    const event = new Event("submit", { bubbles: true, cancelable: true });
    form.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(login.execute).toHaveBeenCalledOnce();
  });
  function setup() {
    let session: { access: string; refresh: string } | null = null;
    const token = "an-invitation-token-0123456789012345";
    const invitation = {
      id: 1,
      email: "expert@example.com",
      status: "pending",
      accountExists: false,
      matchesAccount: false,
      program: { id: 7, name: "Программа" },
    };
    const api = {
      invitation: vi.fn(() => of(invitation)),
      register: vi.fn(() => of({ access: "access", refresh: "refresh", programId: 7 })),
      accept: vi.fn(() => of({ programId: 7, accepted: true })),
      resetPassword: vi.fn(() => of(undefined)),
    };
    const tokens = {
      getTokens: vi.fn(() => session),
      memTokens: vi.fn(v => (session = v)),
      clearTokens: vi.fn(() => (session = null)),
    };
    const profiles = { invalidateProfile: vi.fn(), ensureProfileLoaded: vi.fn() };
    const login = {
      execute: vi.fn(() =>
        of({ ok: true, value: { tokens: { access: "access", refresh: "refresh" } } }),
      ),
    };
    TestBed.configureTestingModule({
      imports: [ExpertInvitationComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ token })),
            snapshot: { queryParamMap: convertToParamMap({}) },
          },
        },
        { provide: EvaluationUseCase, useValue: api },
        { provide: TokenService, useValue: tokens },
        { provide: LoginUseCase, useValue: login },
        { provide: ProfileInfoService, useValue: profiles },
      ],
    });
    const fixture = TestBed.createComponent(ExpertInvitationComponent);
    fixture.detectChanges();
    return {
      fixture,
      component: fixture.componentInstance,
      api,
      tokens,
      profiles,
      login,
      token,
      invitation,
    };
  }
  it("переход по ссылке не создаёт аккаунт и не принимает приглашение", () => {
    const { api } = setup();
    expect(api.invitation).toHaveBeenCalledOnce();
    expect(api.register).not.toHaveBeenCalled();
    expect(api.accept).not.toHaveBeenCalled();
  });
  it("короткая регистрация не содержит birthday, согласия исходно сняты", () => {
    const { component, api } = setup();
    expect(component.registration.contains("birthday")).toBe(false);
    expect(component.registration.controls.acceptPolicy.value).toBe(false);
    component.register();
    expect(api.register).not.toHaveBeenCalled();
  });
  it("создание передаёт только разрешённые поля, сохраняет сессию и не отправляет второе письмо", () => {
    const { component, api, tokens, token } = setup();
    component.registration.setValue({
      firstName: "Анна",
      lastName: "Волкова",
      password: "Password123!",
      repeatPassword: "Password123!",
      acceptPolicy: true,
      acceptAge: true,
    });
    component.register();
    expect(api.register).toHaveBeenCalledWith(
      token,
      expect.objectContaining({ firstName: "Анна", acceptPolicy: true }),
    );
    expect(api.register.mock.calls[0][1]).not.toHaveProperty("birthday");
    expect(api.register.mock.calls[0][1]).not.toHaveProperty("email");
    expect(tokens.memTokens).toHaveBeenCalledOnce();
    expect(component.mode()).toBe("joined");
  });
  it("успешный вход ещё не принимает приглашение", () => {
    const { component, api, login, tokens } = setup();
    component.password.setValue("existing-password");
    component.signIn();
    expect(login.execute).toHaveBeenCalledWith({
      email: "expert@example.com",
      password: "existing-password",
    });
    expect(tokens.memTokens).toHaveBeenCalled();
    expect(api.accept).not.toHaveBeenCalled();
    expect(component.mode()).toBe("intro");
  });
  it("ошибка регистрации сохраняет введённые данные", () => {
    const { component, api } = setup();
    api.register.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 409 })));
    component.registration.setValue({
      firstName: "Анна",
      lastName: "Волкова",
      password: "Password123!",
      repeatPassword: "Password123!",
      acceptPolicy: true,
      acceptAge: true,
    });
    component.register();
    expect(component.registration.controls.firstName.value).toBe("Анна");
    expect(component.error()).toBeTruthy();
    expect(component.busy()).toBe(false);
  });
  it("восстановление отправляет контекст именно этого приглашения", () => {
    const { component, api, token } = setup();
    component.resetPassword();
    expect(api.resetPassword).toHaveBeenCalledWith(token, "expert@example.com");
    expect(component.mode()).toBe("sent");
  });
  it("принятое приглашение позволяет восстановить пароль после выхода", () => {
    const { component, api, fixture, invitation } = setup();
    api.invitation.mockReturnValue(of({ ...invitation, status: "accepted", accountExists: true }));
    component.load();
    component.changeMode("reset");
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("Восстановление пароля");
    expect(fixture.nativeElement.textContent).not.toContain("Приглашение уже принято");
    component.resetPassword();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("Проверьте почту");
  });
});
