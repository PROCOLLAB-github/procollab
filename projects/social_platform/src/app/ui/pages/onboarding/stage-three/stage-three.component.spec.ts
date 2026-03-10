/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { OnboardingStageThreeComponent } from "./stage-three.component";
import { of } from "rxjs";
import { AuthRepository } from "projects/social_platform/src/app/infrastructure/repository/auth/auth.repository";
import { OnboardingService } from "../../../../api/onboarding/onboarding.service";
import { RouterTestingModule } from "@angular/router/testing";

describe("StageThreeComponent", () => {
  let component: OnboardingStageThreeComponent;
  let fixture: ComponentFixture<OnboardingStageThreeComponent>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj({
      saveProfile: of({}),
      setOnboardingStage: of({}),
    });
    const onboardingSpy = jasmine.createSpyObj({}, { formValue$: of({}) });

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, OnboardingStageThreeComponent],
      providers: [
        { provide: AuthRepository, useValue: authSpy },
        { provide: OnboardingService, useValue: onboardingSpy },
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
