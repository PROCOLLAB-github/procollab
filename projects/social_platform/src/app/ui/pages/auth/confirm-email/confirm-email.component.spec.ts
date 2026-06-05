/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ConfirmEmailComponent } from "./confirm-email.component";
import { AuthRepository } from "@infrastructure/repository/auth/auth.repository";
import { provideRouter } from "@angular/router";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { of } from "rxjs";
import { API_URL, PRODUCTION } from "@corelib";
import { TokenService } from "@corelib";

describe("ConfirmEmailComponent", () => {
  let component: ConfirmEmailComponent;
  let fixture: ComponentFixture<ConfirmEmailComponent>;

  beforeEach(async () => {
    const authSpy = { getTokens: vi.fn(), memTokens: vi.fn() };
    const authPortSpy = {
      login: of({} as any),
      logout: of(undefined),
      fetchProfile: of({} as any),
      fetchUserRoles: of([]),
      fetchChangeableRoles: of([]),
      fetchLeaderProjects: of({} as any),
      resendEmail: of({} as any),
    };
    const tokenSpy = { getTokens: vi.fn().mockReturnValue(null), memTokens: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ConfirmEmailComponent, HttpClientTestingModule],
      providers: [
        { provide: AuthRepository, useValue: authSpy },
        { provide: AuthRepositoryPort, useValue: authPortSpy },
        { provide: TokenService, useValue: tokenSpy },
        { provide: API_URL, useValue: "" },
        { provide: PRODUCTION, useValue: false },
        provideRouter([]),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
