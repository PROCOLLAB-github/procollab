/** @format */

import { DestroyRef, inject, Injectable } from "@angular/core";
import { concatMap, of } from "rxjs";
import { OnboardingService } from "../../onboarding.service";
import { ValidationService } from "@corelib";
import { Router } from "@angular/router";
import { OnboardingStageZeroUIInfoService } from "./ui/onboarding-stage-zero-ui-info.service";
import { User } from "@domain/auth/user.model";
import { OnboardingUIInfoService } from "./ui/onboarding-ui-info.service";
import { failure, initial, loading } from "@domain/shared/async-state";
import { AppRoutes } from "@api/paths/app-routes";
import { UpdateProfileUseCase } from "@api/auth/use-cases/update-profile.use-case";
import { UpdateOnboardingStageUseCase } from "@api/auth/use-cases/update-onboarding-stage.use-case";
import { ProfileInfoService } from "@api/profile/facades/profile-info.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { INVALID_PROFILE_ID_MESSAGE, isValidProfileId } from "@domain/auth/profile-id";

/** Координирует первый шаг онбординга: профильные поля, FormArray, сохранение этапа. */
@Injectable()
export class OnboardingStageZeroInfoService {
  private readonly router = inject(Router);
  private readonly validationService = inject(ValidationService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly onboardingService = inject(OnboardingService);
  private readonly onboardingUIInfoService = inject(OnboardingUIInfoService);
  private readonly onboardingStageZeroUIInfoService = inject(OnboardingStageZeroUIInfoService);
  private readonly profileInfoService = inject(ProfileInfoService);

  private readonly updateProfileUseCase = inject(UpdateProfileUseCase);
  private readonly updateOnboardingStageUseCase = inject(UpdateOnboardingStageUseCase);

  private readonly profile = this.profileInfoService.profile;
  private readonly stageForm = this.onboardingStageZeroUIInfoService.stageForm;
  private readonly achievements = this.onboardingStageZeroUIInfoService.achievements;
  private readonly education = this.onboardingStageZeroUIInfoService.education;
  private readonly workExperience = this.onboardingStageZeroUIInfoService.workExperience;
  private readonly userLanguages = this.onboardingStageZeroUIInfoService.userLanguages;

  private readonly stageSubmitting = this.onboardingUIInfoService.stageSubmitting$;
  private readonly skipSubmitting = this.onboardingUIInfoService.skipSubmitting$;

  initializationStageZero(): void {
    if (this.profile()) {
      this.onboardingStageZeroUIInfoService.applySetProfile(this.profile()!);
    }

    this.onboardingService.formValue$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(fv => {
      this.onboardingStageZeroUIInfoService.applyInitStageZero(fv);
    });
  }

  initializationFormValues(): void {
    this.onboardingService.formValue$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(formValues => {
        this.onboardingStageZeroUIInfoService.applyInitFormValues(formValues);

        this.onboardingStageZeroUIInfoService.applyInitWorkExperience(formValues);
        this.onboardingStageZeroUIInfoService.applyInitEducation(formValues);
        this.onboardingStageZeroUIInfoService.applyInitUserLanguages(formValues);
        this.onboardingStageZeroUIInfoService.applyInitAchievements(formValues);
      });
  }

  onSkipRegistration(): void {
    if (!this.validationService.getFormValidation(this.stageForm)) {
      return;
    }

    const profile = this.profile();
    if (!isValidProfileId(profile?.id)) {
      this.skipSubmitting.set(failure("skip_error"));
      this.onboardingStageZeroUIInfoService.applySkipRegistrationModalError(
        new Error(INVALID_PROFILE_ID_MESSAGE),
      );
      return;
    }

    const onboardingSkipInfo = {
      avatar: this.stageForm.get("avatar")?.value,
      city: this.stageForm.get("city")?.value,
    };

    this.skipSubmitting.set(loading());

    this.updateProfileUseCase
      .execute(profile.id, onboardingSkipInfo as Partial<User>)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: result => {
          if (!result.ok) {
            this.skipSubmitting.set(failure("skip_error"));
            this.onboardingStageZeroUIInfoService.applySkipRegistrationModalError(
              result.error.cause,
            );
            return;
          }

          this.profileInfoService.applyProfileUpdated(result.value);
          this.completeRegistration(3);
        },
      });
  }

  onSubmit(): void {
    if (!this.validationService.getFormValidation(this.stageForm)) {
      this.achievements.markAllAsTouched();
      return;
    }

    const profile = this.profile();
    if (!isValidProfileId(profile?.id)) {
      this.stageSubmitting.set(failure("submit_error"));
      this.onboardingStageZeroUIInfoService.applySubmitModalError(
        new Error(INVALID_PROFILE_ID_MESSAGE),
      );
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
      .execute(profile.id, newStageForm as Partial<User>)
      .pipe(
        concatMap(result =>
          result.ok ? this.updateOnboardingStageUseCase.execute(1, profile.id) : of(result),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: result => {
          if (!result.ok) {
            this.stageSubmitting.set(failure("submit_error"));
            this.onboardingStageZeroUIInfoService.applySubmitModalError(result.error.cause);
            return;
          }

          this.profileInfoService.applyProfileUpdated(result.value);
          this.completeRegistration(1);
        },
      });
  }

  private completeRegistration(stage: number): void {
    this.skipSubmitting.set(loading());
    this.onboardingService.setFormValue(this.stageForm.value as Partial<User>);
    this.router.navigateByUrl(
      stage === 1 ? AppRoutes.onboarding.stage(1) : AppRoutes.onboarding.stage(3),
    );
    this.skipSubmitting.set(initial());
  }
}
