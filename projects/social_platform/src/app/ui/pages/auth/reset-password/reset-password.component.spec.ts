/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ResetPasswordComponent } from "./reset-password.component";
import { ReactiveFormsModule } from "@angular/forms";
import { of } from "rxjs";
import { AuthRepository } from "@infrastructure/repository/auth/auth.repository";
import { provideNgxMask } from "ngx-mask";
import { provideRouter } from "@angular/router";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";

describe("ResetPasswordComponent", () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj({ resetPassword: of({}) });
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
      imports: [ReactiveFormsModule, ResetPasswordComponent],
      providers: [
        { provide: AuthRepository, useValue: authSpy },
        { provide: AuthRepositoryPort, useValue: authPortSpy },
        provideRouter([]),
        provideNgxMask(),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
