/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { RegisterComponent } from "./register.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AuthRepository } from "@infrastructure/repository/auth/auth.repository";
import { InputComponent } from "@ui/primitives";
import { provideNgxMask } from "ngx-mask";
import { provideRouter } from "@angular/router";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { of } from "rxjs";
import { API_URL, PRODUCTION } from "@corelib";
import { AuthUIInfoService } from "@api/auth/facades/ui/auth-ui-info.service";

describe("RegisterComponent", () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

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

    return await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        RegisterComponent,
        InputComponent,
        HttpClientTestingModule,
      ],
      providers: [
        { provide: AuthRepository, useValue: authSpy },
        { provide: AuthRepositoryPort, useValue: authPortSpy },
        { provide: API_URL, useValue: "" },
        { provide: PRODUCTION, useValue: false },
        provideRouter([]),
        provideNgxMask(),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("uses full-width native password inputs with sibling visibility controls", () => {
    const password = fixture.nativeElement.querySelector(
      'input[name="new-password"]',
    ) as HTMLInputElement;
    const repeatedPassword = fixture.nativeElement.querySelector(
      'input[name="new-password-confirmation"]',
    ) as HTMLInputElement;
    const birthdayField = fixture.nativeElement.querySelector(
      'app-input[id="birthday"]',
    ) as HTMLElement;

    expect(password.autocomplete).toBe("new-password");
    expect(repeatedPassword.autocomplete).toBe("new-password");
    expect(password.closest("app-input")?.classList).toContain("auth__password-input");
    expect(repeatedPassword.closest("app-input")?.classList).toContain("auth__password-input");
    for (const nativePassword of [password, repeatedPassword]) {
      const field = nativePassword.closest("app-input")?.querySelector(".field") as HTMLElement;
      const eyeSlot = field.querySelector(".field__right-icon") as HTMLElement;
      expect(field.querySelector(".field__native-input-area")).toBeNull();
      expect(nativePassword.parentElement).toBe(field);
      expect(eyeSlot.parentElement).toBe(field);
      expect(field.lastElementChild).toBe(eyeSlot);
    }
    expect(birthdayField.classList).not.toContain("auth__password-input");
    expect((fixture.nativeElement.querySelector("form") as HTMLFormElement).noValidate).toBe(true);
  });

  it("keeps both custom password visibility controls clickable", () => {
    const password = fixture.nativeElement.querySelector(
      'input[name="new-password"]',
    ) as HTMLInputElement;
    const repeatedPassword = fixture.nativeElement.querySelector(
      'input[name="new-password-confirmation"]',
    ) as HTMLInputElement;

    (password.closest("app-input")?.querySelector(".field__right-icon i") as HTMLElement).click();
    fixture.detectChanges();
    expect(password.type).toBe("text");

    (
      repeatedPassword.closest("app-input")?.querySelector(".field__right-icon i") as HTMLElement
    ).click();
    fixture.detectChanges();
    expect(repeatedPassword.type).toBe("text");
  });

  it("keeps email errors and both password visibility controls in separate suffix elements", () => {
    const authUIInfoService = fixture.debugElement.injector.get(AuthUIInfoService);
    authUIInfoService.registerForm.get("email")?.markAsTouched();
    authUIInfoService.registerForm.get("password")?.markAsTouched();
    authUIInfoService.registerForm.get("repeatedPassword")?.markAsTouched();
    fixture.detectChanges();

    const emailField = fixture.nativeElement
      .querySelector('input[type="email"]')
      .closest("app-input") as HTMLElement;
    const passwordFields = Array.from(
      fixture.nativeElement.querySelectorAll("app-input.auth__password-input"),
    ) as HTMLElement[];

    expect(emailField.querySelector(".field__error-icon")).not.toBeNull();
    expect(emailField.querySelector(".field__right-icon i")).toBeNull();
    expect(passwordFields).toHaveLength(2);
    for (const passwordField of passwordFields) {
      expect(passwordField.querySelector(".field__error-icon")).not.toBeNull();
      expect(passwordField.querySelector(".field__right-icon i")).not.toBeNull();
      expect(passwordField.querySelector(".field")?.lastElementChild?.classList).toContain(
        "field__right-icon",
      );
    }
  });
});
