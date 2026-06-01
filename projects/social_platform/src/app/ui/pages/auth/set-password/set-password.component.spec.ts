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
    const authSpy = jasmine.createSpyObj({ setPassword: of({}) });
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
});
