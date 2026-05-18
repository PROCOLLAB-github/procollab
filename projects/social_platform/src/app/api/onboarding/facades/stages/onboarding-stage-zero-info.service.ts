/** @format */

import { inject, Injectable } from "@angular/core";
import { concatMap, of, Subject, takeUntil } from "rxjs";
import { OnboardingService } from "../../onboarding.service";
import { ValidationService } from "@corelib";
import { Router } from "@angular/router";
import { OnboardingStageZeroUIInfoService } from "./ui/onboarding-stage-zero-ui-info.service";
import { User } from "@domain/auth/user.model";
import { OnboardingUIInfoService } from "./ui/onboarding-ui-info.service";
import { failure, initial, loading } from "@domain/shared/async-state";
import { AppRoutes } from "@api/paths/app-routes";
import { GetProfileUseCase } from "@api/auth/use-cases/get-profile.use-case";
import { UpdateProfileUseCase } from "@api/auth/use-cases/update-profile.use-case";
import { UpdateOnboardingStageUseCase } from "@api/auth/use-cases/update-onboarding-stage.use-case";

@Injectable()
export class OnboardingStageZeroInfoService {
  private readonly onboardingService = inject(OnboardingService);
  private readonly onboardingUIInfoService = inject(OnboardingUIInfoService);
  private readonly onboardingStageZeroUIInfoService = inject(OnboardingStageZeroUIInfoService);
  private readonly validationService = inject(ValidationService);
  private readonly getProfileUseCase = inject(GetProfileUseCase);
  private readonly router = inject(Router);
  private readonly updateProfileUseCase = inject(UpdateProfileUseCase);
  private readonly updateOnboardingStageUseCase = inject(UpdateOnboardingStageUseCase);

  private readonly destroy$ = new Subject<void>();

  private readonly stageForm = this.onboardingStageZeroUIInfoService.stageForm;
  private readonly achievements = this.onboardingStageZeroUIInfoService.achievements;
  private readonly education = this.onboardingStageZeroUIInfoService.education;
  private readonly workExperience = this.onboardingStageZeroUIInfoService.workExperience;
  private readonly userLanguages = this.onboardingStageZeroUIInfoService.userLanguages;

  private readonly stageSubmitting = this.onboardingUIInfoService.stageSubmitting$;
  private readonly skipSubmitting = this.onboardingUIInfoService.skipSubmitting$;

  initializationStageZero(): void {
    this.getProfileUseCase
      .execute()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: result => {
          if (!result.ok) return;
          this.onboardingStageZeroUIInfoService.applySetProfile(result.value);
        },
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

    this.skipSubmitting.set(loading());

    this.updateProfileUseCase
      .execute(onboardingSkipInfo as Partial<User>)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: result => {
          if (!result.ok) {
            this.skipSubmitting.set(failure("skip_error"));
            this.onboardingStageZeroUIInfoService.applySkipRegistrationModalError(
              result.error.cause
            );
            return;
          }

          this.completeRegistration(3);
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

    this.stageSubmitting.set(loading());

    this.updateProfileUseCase
      .execute(newStageForm as Partial<User>)
      .pipe(
        concatMap(result =>
          result.ok ? this.updateOnboardingStageUseCase.execute(1) : of(result)
        ),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: result => {
          if (!result.ok) {
            this.stageSubmitting.set(failure("submit_error"));
            this.onboardingStageZeroUIInfoService.applySubmitModalError(result.error.cause);
            return;
          }

          this.completeRegistration(1);
        },
      });
  }

  private completeRegistration(stage: number): void {
    this.skipSubmitting.set(loading());
    this.onboardingService.setFormValue(this.stageForm.value as Partial<User>);
    this.router.navigateByUrl(
      stage === 1 ? AppRoutes.onboarding.stage(1) : AppRoutes.onboarding.stage(3)
    );
    this.skipSubmitting.set(initial());
  }
}
