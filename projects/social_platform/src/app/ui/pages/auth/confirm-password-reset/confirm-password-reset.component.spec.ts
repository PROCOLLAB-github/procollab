/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ConfirmPasswordResetComponent } from "./confirm-password-reset.component";
import { provideRouter } from "@angular/router";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { of } from "rxjs";
import { AuthUIInfoService } from "@api/auth/facades/ui/auth-ui-info.service";
import { PRODUCTION } from "@corelib";

describe("ConfirmPasswordResetComponent", () => {
  let component: ConfirmPasswordResetComponent;
  let fixture: ComponentFixture<ConfirmPasswordResetComponent>;

  beforeEach(async () => {
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
      imports: [ConfirmPasswordResetComponent],
      providers: [
        { provide: AuthRepositoryPort, useValue: authPortSpy },
        { provide: AuthUIInfoService, useValue: {} },
        { provide: PRODUCTION, useValue: false },
        provideRouter([]),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmPasswordResetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
