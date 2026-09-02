/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { LoginComponent } from "./login.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AuthRepository } from "@infrastructure/repository/auth/auth.repository";
import { InputComponent } from "@ui/primitives";
import { provideNgxMask } from "ngx-mask";
import { provideRouter } from "@angular/router";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { ProjectSubscriptionRepositoryPort } from "@domain/project/ports/project-subscription.repository.port";
import { of } from "rxjs";
import { API_URL, PRODUCTION } from "@corelib";
import { AuthUIInfoService } from "@api/auth/facades/ui/auth-ui-info.service";

describe("LoginComponent", () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    const authSpy = { login: vi.fn(), memTokens: vi.fn(), clearTokens: vi.fn() };
    const authPortSpy = {
      login: of({} as any),
      logout: of(undefined),
      fetchProfile: of({} as any),
      fetchUserRoles: of([]),
      fetchChangeableRoles: of([]),
      fetchLeaderProjects: of({} as any),
    };

    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        LoginComponent,
        InputComponent,
        HttpClientTestingModule,
      ],
      providers: [
        { provide: AuthRepository, useValue: authSpy },
        { provide: AuthRepositoryPort, useValue: authPortSpy },
        { provide: API_URL, useValue: "" },
        { provide: PRODUCTION, useValue: false },
        {
          provide: ProjectSubscriptionRepositoryPort,
          useValue: { getSubscriptions: of({ results: [], count: 0 }) },
        },
        provideRouter([]),
        provideNgxMask(),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("uses the browser current-password contract without covering the eye control", () => {
    const password = fixture.nativeElement.querySelector(
      'input[name="password"]',
    ) as HTMLInputElement;
    const passwordField = password.closest("app-input") as HTMLElement;
    const email = fixture.nativeElement.querySelector('input[type="email"]') as HTMLInputElement;
    const emailField = email.closest("app-input") as HTMLElement;

    expect(password.autocomplete).toBe("current-password");
    expect(passwordField.classList).toContain("auth__password-input");
    const field = passwordField.querySelector(".field") as HTMLElement;
    const nativeArea = field.querySelector(".field__native-input-area") as HTMLElement;
    const eyeSlot = field.querySelector(".field__right-icon") as HTMLElement;
    expect(field.classList).toContain("field--right-action-outside");
    expect(nativeArea.contains(password)).toBe(true);
    expect(nativeArea.contains(eyeSlot)).toBe(false);
    expect(field.lastElementChild).toBe(eyeSlot);
    expect(emailField.classList).not.toContain("auth__password-input");
    expect((fixture.nativeElement.querySelector("form") as HTMLFormElement).noValidate).toBe(true);
  });

  it("keeps the custom password visibility control clickable", () => {
    const password = fixture.nativeElement.querySelector(
      'input[name="password"]',
    ) as HTMLInputElement;
    const toggle = password
      .closest("app-input")
      ?.querySelector(".field__right-icon i") as HTMLElement;

    expect(password.type).toBe("password");
    toggle.click();
    fixture.detectChanges();

    expect(password.type).toBe("text");
  });

  it("keeps validation and visibility icons in separate password suffix elements", () => {
    const authUIInfoService = fixture.debugElement.injector.get(AuthUIInfoService);
    authUIInfoService.loginForm.get("email")?.markAsTouched();
    authUIInfoService.loginForm.get("password")?.markAsTouched();
    fixture.detectChanges();

    const emailField = fixture.nativeElement
      .querySelector('input[type="email"]')
      .closest("app-input") as HTMLElement;
    const passwordField = fixture.nativeElement.querySelector(
      "app-input.auth__password-input",
    ) as HTMLElement;

    expect(emailField.querySelector(".field__error-icon")).not.toBeNull();
    expect(emailField.querySelector(".field__right-icon i")).toBeNull();
    expect(passwordField.querySelector(".field__error-icon")).not.toBeNull();
    expect(passwordField.querySelector(".field__right-icon i")).not.toBeNull();
    expect(passwordField.querySelector(".field")?.lastElementChild?.classList).toContain(
      "field__right-icon",
    );
  });
});
