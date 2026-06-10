/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { OnboardingStageThreeComponent } from "./stage-three.component";
import { of } from "rxjs";
import { AuthRepository } from "@infrastructure/repository/auth/auth.repository";
import { OnboardingService } from "@api/onboarding/onboarding.service";
import { provideRouter } from "@angular/router";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { ProjectSubscriptionRepositoryPort } from "@domain/project/ports/project-subscription.repository.port";

describe("StageThreeComponent", () => {
  let component: OnboardingStageThreeComponent;
  let fixture: ComponentFixture<OnboardingStageThreeComponent>;

  beforeEach(async () => {
    const authSpy = {
      saveProfile: vi.fn().mockReturnValue(of({})),
      setOnboardingStage: vi.fn().mockReturnValue(of({})),
    };
    const onboardingSpy = { formValue$: of({}) };

    const authPortSpy = { updateProfile: of({}) };

    await TestBed.configureTestingModule({
      imports: [OnboardingStageThreeComponent],
      providers: [
        { provide: AuthRepository, useValue: authSpy },
        { provide: OnboardingService, useValue: onboardingSpy },
        { provide: AuthRepositoryPort, useValue: authPortSpy },
        {
          provide: ProjectSubscriptionRepositoryPort,
          useValue: { getSubscriptions: of({ results: [], count: 0 }) },
        },
        provideRouter([]),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OnboardingStageThreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
