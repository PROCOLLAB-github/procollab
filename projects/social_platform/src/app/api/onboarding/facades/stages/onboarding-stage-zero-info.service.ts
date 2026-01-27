/** @format */

import { inject, Injectable } from "@angular/core";
import { concatMap, Subject, takeUntil } from "rxjs";
import { OnboardingService } from "../../onboarding.service";
import { ValidationService } from "@corelib";
import { Router } from "@angular/router";
import { AuthService } from "../../../auth";
import { OnboardingStageZeroUIInfoService } from "./ui/onboarding-stage-zero-ui-info.service";
import { User } from "projects/social_platform/src/app/domain/auth/user.model";
import { OnboardingUIInfoService } from "./ui/onboarding-ui-info.service";

@Injectable()
export class OnboardingStageZeroInfoService {
  private readonly onboardingService = inject(OnboardingService);
  private readonly onboardingUIInfoService = inject(OnboardingUIInfoService);
  private readonly onboardingStageZeroUIInfoService = inject(OnboardingStageZeroUIInfoService);
  private readonly validationService = inject(ValidationService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  private readonly destroy$ = new Subject<void>();

  private readonly stageForm = this.onboardingStageZeroUIInfoService.stageForm;
  private readonly achievements = this.onboardingStageZeroUIInfoService.achievements;
  private readonly education = this.onboardingStageZeroUIInfoService.education;
  private readonly workExperience = this.onboardingStageZeroUIInfoService.workExperience;
  private readonly userLanguages = this.onboardingStageZeroUIInfoService.userLanguages;

  private readonly stageSubmitting = this.onboardingUIInfoService.stageSubmitting;
  private readonly skipSubmitting = this.onboardingUIInfoService.skipSubmitting;

  initializationStageZero(): void {
    this.authService.profile.pipe(takeUntil(this.destroy$)).subscribe(p => {
      this.onboardingStageZeroUIInfoService.applySetProfile(p);
    });

    this.onboardingService.formValue$.pipe(takeUntil(this.destroy$)).subscribe(fv => {
      this.onboardingStageZeroUIInfoService.applyInitStageZero(fv);
    });
  }

  initializationFormValues(): void {
    this.onboardingService.formValue$.pipe(takeUntil(this.destroy$)).subscribe(formValues => {
      this.onboardingStageZeroUIInfoService.applyInitFormValues(formValues);

      this.onboardingStageZeroUIInfoService.applyInitWorkExperience(formValues);
      this.onboardingStageZeroUIInfoService.applyInitEducation(formValues);
      this.onboardingStageZeroUIInfoService.applyInitUserLanguages(formValues);
      this.onboardingStageZeroUIInfoService.applyInitAchievements(formValues);
    });
  }

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSkipRegistration(): void {
    if (!this.validationService.getFormValidation(this.stageForm)) {
      return;
    }

    const onboardingSkipInfo = {
      avatar: this.stageForm.get("avatar")?.value,
      city: this.stageForm.get("city")?.value,
    };

    this.skipSubmitting.set(true);
    this.authService
      .saveProfile(onboardingSkipInfo as Partial<User>)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.completeRegistration(3),
        error: error => {
          this.skipSubmitting.set(false);
          this.onboardingStageZeroUIInfoService.applySkipRegistrationModalError(error);
        },
      });
  }

  onSubmit(): void {
    if (!this.validationService.getFormValidation(this.stageForm)) {
      this.achievements.markAllAsTouched();
      return;
    }

    const newStageForm = {
      avatar: this.stageForm.get("avatar")?.value,
      city: this.stageForm.get("city")?.value,
      education: this.education.value,
      workExperience: this.workExperience.value,
      userLanguages: this.userLanguages.value,
      achievements: this.achievements.value,
    };

    this.stageSubmitting.set(true);
    this.authService
      .saveProfile(newStageForm as Partial<User>)
      .pipe(
        concatMap(() => this.authService.setOnboardingStage(1)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => this.completeRegistration(1),
        error: error => {
          this.stageSubmitting.set(false);
          this.onboardingStageZeroUIInfoService.applySubmitModalError(error);
        },
      });
  }

  private completeRegistration(stage: number): void {
    this.skipSubmitting.set(true);
    this.onboardingService.setFormValue(this.stageForm.value as Partial<User>);
    this.router.navigateByUrl(
      stage === 1 ? "/office/onboarding/stage-1" : "/office/onboarding/stage-3"
    );
    this.skipSubmitting.set(false);
  }
}
