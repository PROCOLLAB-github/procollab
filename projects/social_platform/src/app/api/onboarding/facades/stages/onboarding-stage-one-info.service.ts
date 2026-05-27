/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { Specialization } from "@domain/specializations/specialization.model";
import { concatMap, map, Observable, of, Subject, take, takeUntil } from "rxjs";
import { OnboardingService } from "../../onboarding.service";
import { ValidationService } from "@corelib";
import { ActivatedRoute, Router } from "@angular/router";
import { SearchesService } from "../../../searches/searches.service";
import { OnboardingStageOneUIInfoService } from "./ui/onboarding-stage-one-ui-info.service";
import { OnboardingUIInfoService } from "./ui/onboarding-ui-info.service";
import { SpecializationsGroup } from "@domain/specializations/specializations-group.model";
import { UpdateProfileUseCase } from "@api/auth/use-cases/update-profile.use-case";
import { UpdateOnboardingStageUseCase } from "@api/auth/use-cases/update-onboarding-stage.use-case";
import { failure, initial, loading } from "@domain/shared/async-state";
import { AppRoutes } from "@api/paths/app-routes";
import { ProfileInfoService } from "@api/profile/facades/profile-info.service";

/** Координирует шаг выбора специализаций и сохранение первого этапа. */
@Injectable()
export class OnboardingStageOneInfoService {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly updateProfileUseCase = inject(UpdateProfileUseCase);
  private readonly updateOnboardingStageUseCase = inject(UpdateOnboardingStageUseCase);

  private readonly onboardingService = inject(OnboardingService);
  private readonly onboardingUIInfoService = inject(OnboardingUIInfoService);
  private readonly onboardingStageOneUIInfoService = inject(OnboardingStageOneUIInfoService);
  private readonly profileInfoService = inject(ProfileInfoService);

  private readonly validationService = inject(ValidationService);
  private readonly searchesService = inject(SearchesService);

  private readonly destroy$ = new Subject<void>();

  private stageForm = this.onboardingStageOneUIInfoService.stageForm;

  private readonly stageSubmitting = this.onboardingUIInfoService.stageSubmitting$;
  private readonly skipSubmitting = this.onboardingUIInfoService.skipSubmitting$;

  readonly inlineSpecializations = this.searchesService.inlineSpecs;

  readonly nestedSpecializations$: Observable<SpecializationsGroup[]> = this.route.data.pipe(
    map(r => r["data"])
  );

  private readonly profile = this.profileInfoService.profile;

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializationFormValues(): void {
    this.onboardingService.formValue$.pipe(take(1), takeUntil(this.destroy$)).subscribe(fv => {
      this.onboardingStageOneUIInfoService.applyInitFormValues(fv);
    });

    this.stageForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value => {
      // Общий OnboardingService хранит черновик между переходами по шагам.
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

    this.updateProfileUseCase
      .execute(this.stageForm.value)
      .pipe(
        concatMap(result =>
          result.ok ? this.updateOnboardingStageUseCase.execute(2, this.profile()!.id) : of(result)
        ),
        takeUntil(this.destroy$)
      )
      .subscribe(result => {
        if (!result.ok) {
          this.stageSubmitting.set(failure("submit_error"));
          return;
        }
        this.profileInfoService.applyProfileUpdated(result.value);
        this.completeRegistration(2);
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
