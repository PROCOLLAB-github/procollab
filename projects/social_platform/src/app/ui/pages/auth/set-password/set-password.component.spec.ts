/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SetPasswordComponent } from "./set-password.component";
import { ReactiveFormsModule } from "@angular/forms";
import { AuthRepository } from "@infrastructure/repository/auth/auth.repository";
import { of } from "rxjs";
import { provideNgxMask } from "ngx-mask";
import { provideRouter } from "@angular/router";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";

describe("SetPasswordComponent", () => {
  let component: SetPasswordComponent;
  let fixture: ComponentFixture<SetPasswordComponent>;

  beforeEach(async () => {
    const authSpy = { setPassword: vi.fn().mockReturnValue(of({})) };
    const authPortSpy = {
      login: of({} as any),
      logout: of(undefined),
      fetchProfile: of({} as any),
      fetchUserRoles: of([]),
      fetchChangeableRoles: of([]),
      fetchLeaderProjects: of({} as any),
      resetPassword: of(undefined),
      setPassword: of(undefined),
    };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, SetPasswordComponent],
      providers: [
        { provide: AuthRepository, useValue: authSpy },
        { provide: AuthRepositoryPort, useValue: authPortSpy },
        provideRouter([]),
        provideNgxMask(),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SetPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("uses independent accessible new-password controls for both fields", () => {
    const inputs = fixture.nativeElement.querySelectorAll(
      'input[autocomplete="new-password"]',
    ) as NodeListOf<HTMLInputElement>;
    const toggles = fixture.nativeElement.querySelectorAll(
      ".auth__password-toggle",
    ) as NodeListOf<HTMLButtonElement>;

    expect(inputs).toHaveLength(2);
    expect(inputs[0].name).toBe("new-password");
    expect(inputs[1].name).toBe("new-password-confirmation");
    expect(inputs[0].type).toBe("password");
    expect(inputs[1].type).toBe("password");
    expect(toggles).toHaveLength(2);
    expect(toggles[0].type).toBe("button");
    expect(toggles[0].getAttribute("aria-label")).toBe("Показать пароль");
    expect(toggles[1].getAttribute("aria-label")).toBe("Показать повторный пароль");

    toggles[0].click();
    fixture.detectChanges();
    expect(inputs[0].type).toBe("text");
    expect(inputs[1].type).toBe("password");
    expect(toggles[0].getAttribute("aria-pressed")).toBe("true");

    toggles[1].click();
    fixture.detectChanges();
    expect(inputs[0].type).toBe("text");
    expect(inputs[1].type).toBe("text");
    expect(toggles[1].getAttribute("aria-pressed")).toBe("true");
  });
});
