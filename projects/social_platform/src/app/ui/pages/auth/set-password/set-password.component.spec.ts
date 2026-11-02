/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SetPasswordComponent } from "./set-password.component";
import { ReactiveFormsModule } from "@angular/forms";
import { AuthRepository } from "@infrastructure/repository/auth/auth.repository";
import { of } from "rxjs";
import { provideNgxMask } from "ngx-mask";
import { provideRouter } from "@angular/router";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { AuthUIInfoService } from "@api/auth/facades/ui/auth-ui-info.service";

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
  it("показывает ошибку ссылки вместо ошибки логина и сохраняет новый пароль в форме", () => {
    const ui = fixture.debugElement.injector.get(AuthUIInfoService);
    ui.passwordForm.setValue({
      password: "Pr517-unit-only-Aa1!",
      passwordRepeated: "Pr517-unit-only-Aa1!",
    });
    ui.password$.set({ status: "failure", error: { kind: "invalid_token" } });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      "Ссылка восстановления недействительна или истекла.",
    );
    expect(fixture.nativeElement.textContent).not.toContain("Неправильный логин или пароль");
    expect(ui.passwordForm.value.password).toBe("Pr517-unit-only-Aa1!");
  });
  it("ошибку сервера показывает как сбой сохранения пароля", () => {
    const ui = fixture.debugElement.injector.get(AuthUIInfoService);
    ui.password$.set({ status: "failure", error: { kind: "server_error", status: 500 } });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      "Не удалось сохранить новый пароль. Попробуйте позже.",
    );
  });
});
