/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { Specialization } from "@domain/specializations/specialization";
import { concatMap, map, Observable, Subject, take, takeUntil } from "rxjs";
import { OnboardingService } from "../../onboarding.service";
import { ValidationService } from "@corelib";
import { ActivatedRoute, Router } from "@angular/router";
import { SearchesService } from "../../../searches/searches.service";
import { OnboardingStageOneUIInfoService } from "./ui/onboarding-stage-one-ui-info.service";
import { OnboardingUIInfoService } from "./ui/onboarding-ui-info.service";
import { SpecializationsGroup } from "@domain/specializations/specializations-group";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { failure, initial, loading } from "@domain/shared/async-state";
import { AppRoutes } from "@api/paths/app-routes";

@Injectable()
export class OnboardingStageOneInfoService {
  private readonly authRepository = inject(AuthRepositoryPort);
  private readonly onboardingService = inject(OnboardingService);
  private readonly onboardingUIInfoService = inject(OnboardingUIInfoService);
  private readonly validationService = inject(ValidationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly onboardingStageOneUIInfoService = inject(OnboardingStageOneUIInfoService);
  private readonly searchesService = inject(SearchesService);

  private readonly destroy$ = new Subject<void>();

  private stageForm = this.onboardingStageOneUIInfoService.stageForm;

  private readonly stageSubmitting = this.onboardingUIInfoService.stageSubmitting$;
  private readonly skipSubmitting = this.onboardingUIInfoService.skipSubmitting$;

  readonly inlineSpecializations = this.searchesService.inlineSpecs;

  readonly nestedSpecializations$: Observable<SpecializationsGroup[]> = this.route.data.pipe(
    map(r => r["data"])
  );

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

    this.stageSubmitting.set(loading());

    this.authRepository
      .updateProfile(this.stageForm.value)
      .pipe(
        concatMap(() => this.authRepository.updateOnboardingStage(2)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => this.completeRegistration(2),
        error: () => this.stageSubmitting.set(failure("submit_error")),
      });
  }

  onSelectSpec(speciality: Specialization): void {
    this.searchesService.onSelectSpec(this.stageForm, speciality);
  }

  onSearchSpec(query: string): void {
    this.searchesService.onSearchSpec(query);
  }

  private completeRegistration(stage: number): void {
    this.skipSubmitting.set(loading());
    this.onboardingService.setFormValue(this.stageForm.value);
    this.router.navigateByUrl(
      stage === 2 ? AppRoutes.onboarding.stage(stage) : AppRoutes.onboarding.stage(3)
    );
    this.skipSubmitting.set(initial());
  }
}
