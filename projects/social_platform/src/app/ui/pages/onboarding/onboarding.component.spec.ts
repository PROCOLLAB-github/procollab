/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { OnboardingComponent } from "./onboarding.component";
import { provideRouter } from "@angular/router";
import { EMPTY, of } from "rxjs";
import { AuthRepository } from "@infrastructure/repository/auth/auth.repository";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { OnboardingService } from "@api/onboarding/onboarding.service";

describe("OnboardingComponent", () => {
  let component: OnboardingComponent;
  let fixture: ComponentFixture<OnboardingComponent>;

  beforeEach(async () => {
    const authSpy = {
      profile: of({}),
    };

    const authPortSpy = {
      fetchProfile: of({}),
      fetchUserRoles: of([]),
      fetchChangeableRoles: of([]),
    };

    const onboardingSpy = { currentStage$: EMPTY };

    await TestBed.configureTestingModule({
      imports: [OnboardingComponent, HttpClientTestingModule],
      providers: [
        { provide: AuthRepository, useValue: authSpy },
        { provide: AuthRepositoryPort, useValue: authPortSpy },
        { provide: OnboardingService, useValue: onboardingSpy },
        provideRouter([]),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OnboardingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
