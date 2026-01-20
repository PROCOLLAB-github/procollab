/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { Specialization } from "projects/social_platform/src/app/domain/specializations/specialization";
import { concatMap, Subject, take, takeUntil } from "rxjs";
import { AuthService } from "../../../auth";
import { OnboardingService } from "../../onboarding.service";
import { ValidationService } from "@corelib";
import { Router } from "@angular/router";
import { SearchesService } from "../../../searches/searches.service";
import { OnboardingStageOneUIInfoService } from "./ui/onboarding-stage-one-ui-info.service";
import { OnboardingUIInfoService } from "./ui/onboarding-ui-info.service";

@Injectable()
export class OnboardingStageOneInfoService {
  private readonly authService = inject(AuthService);
  private readonly onboardingService = inject(OnboardingService);
  private readonly onboardingUIInfoService = inject(OnboardingUIInfoService);
  private readonly validationService = inject(ValidationService);
  private readonly router = inject(Router);
  private readonly onboardingStageOneUIInfoService = inject(OnboardingStageOneUIInfoService);
  private readonly searchesService = inject(SearchesService);

  private readonly destroy$ = new Subject<void>();

  private stageForm = this.onboardingStageOneUIInfoService.stageForm;

  private readonly stageSubmitting = this.onboardingUIInfoService.stageSubmitting;
  private readonly skipSubmitting = this.onboardingUIInfoService.skipSubmitting;

  readonly inlineSpecializations = this.searchesService.inlineSpecs;

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializationFormValues(): void {
    this.onboardingService.formValue$.pipe(take(1), takeUntil(this.destroy$)).subscribe(fv => {
      this.onboardingStageOneUIInfoService.applyInitFormValues(fv);
    });

    this.stageForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value => {
      this.onboardingService.setFormValue(value);
    });
  }

  initializationSpeciality(): void {
    this.onboardingService.formValue$.pipe(takeUntil(this.destroy$)).subscribe(fv => {
      this.onboardingStageOneUIInfoService.applyInitSpeciality(fv);
    });
  }

  onSkipRegistration(): void {
    if (!this.validationService.getFormValidation(this.stageForm)) {
      return;
    }

    this.completeRegistration(3);
  }

  onSubmit(): void {
    if (!this.validationService.getFormValidation(this.stageForm)) {
      return;
    }

    this.stageSubmitting.set(true);

    this.authService
      .saveProfile(this.stageForm.value)
      .pipe(
        concatMap(() => this.authService.setOnboardingStage(2)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => this.completeRegistration(2),
        error: () => this.stageSubmitting.set(false),
      });
  }

  onSelectSpec(speciality: Specialization): void {
    this.searchesService.onSelectSpec(this.stageForm, speciality);
  }

  onSearchSpec(query: string): void {
    this.searchesService.onSearchSpec(query);
  }

  private completeRegistration(stage: number): void {
    this.skipSubmitting.set(true);
    this.onboardingService.setFormValue(this.stageForm.value);
    this.router.navigateByUrl(
      stage === 2 ? `/office/onboarding/stage-${stage}` : "/office/onboarding/stage-3"
    );
    this.skipSubmitting.set(false);
  }
}
