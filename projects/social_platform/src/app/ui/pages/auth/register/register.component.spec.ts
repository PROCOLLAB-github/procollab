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

describe("RegisterComponent", () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj("AuthRepository", ["login", "memTokens", "clearTokens"]);
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
});
