/** @format */

import { inject, Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { concatMap, of, Subject, take, takeUntil } from "rxjs";
import { ValidationService } from "@corelib";
import { OnboardingService } from "../../onboarding.service";
import { Skill } from "@domain/skills/skill.model";
import { OnboardingUIInfoService } from "./ui/onboarding-ui-info.service";
import { OnboardingStageTwoUIInfoService } from "./ui/onboarding-stage-two-ui-info.service";
import { UpdateProfileUseCase } from "@api/auth/use-cases/update-profile.use-case";
import { UpdateOnboardingStageUseCase } from "@api/auth/use-cases/update-onboarding-stage.use-case";
import { failure, initial, loading } from "@domain/shared/async-state";
import { AppRoutes } from "@api/paths/app-routes";
import { SearchesService } from "@api/searches/searches.service";

@Injectable()
export class OnboardingStageTwoInfoService {
  private readonly updateProfileUseCase = inject(UpdateProfileUseCase);
  private readonly updateOnboardingStageUseCase = inject(UpdateOnboardingStageUseCase);
  private readonly onboardingService = inject(OnboardingService);
  private readonly onboardingUIInfoService = inject(OnboardingUIInfoService);
  private readonly onboardingStageTwoUIInfoService = inject(OnboardingStageTwoUIInfoService);
  private readonly validationService = inject(ValidationService);
  private readonly router = inject(Router);
  private readonly searchesService = inject(SearchesService);

  private readonly destroy$ = new Subject<void>();

  private readonly stageForm = this.onboardingStageTwoUIInfoService.stageForm;

  private readonly stageSubmitting = this.onboardingUIInfoService.stageSubmitting$;
  private readonly skipSubmitting = this.onboardingUIInfoService.skipSubmitting$;

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializationFormValues(): void {
    this.onboardingService.formValue$
      .pipe(take(1), takeUntil(this.destroy$))
      .subscribe(({ skills }) => this.onboardingStageTwoUIInfoService.applyInitFormValues(skills));

    this.stageForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value => {
      this.onboardingService.setFormValue(value);
    });
  }

  initializationSkills(): void {
    this.onboardingService.formValue$.pipe(takeUntil(this.destroy$)).subscribe(fv => {
      this.onboardingStageTwoUIInfoService.applyInitSkills(fv);
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

    const { skills } = this.stageForm.getRawValue();

    this.updateProfileUseCase
      .execute({ skillsIds: skills.map((skill: Skill) => skill.id) })
      .pipe(
        concatMap(result =>
          result.ok ? this.updateOnboardingStageUseCase.execute(2) : of(result)
        ),
        takeUntil(this.destroy$)
      )
      .subscribe(result => {
        if (!result.ok) {
          this.stageSubmitting.set(failure("submit_error"));
          this.onboardingStageTwoUIInfoService.applySubmitErrorModal(result.error.cause);
          return;
        }
        this.completeRegistration(3);
      });
  }

  onAddSkill(newSkill: Skill): void {
    this.searchesService.onAddSkill(newSkill, this.stageForm);
  }

  onRemoveSkill(oddSkill: Skill): void {
    this.searchesService.onRemoveSkill(oddSkill, this.stageForm);
  }

  onOptionToggled(toggledSkill: Skill): void {
    const { skills } = this.stageForm.getRawValue();

    const isPresent = skills.some((skill: Skill) => skill.id === toggledSkill.id);

    if (isPresent) {
      this.onRemoveSkill(toggledSkill);
    } else {
      this.onAddSkill(toggledSkill);
    }
  }

  onSearchSkill(query: string): void {
    this.searchesService.onSearchSkill(query);
  }

  private completeRegistration(stage: number): void {
    this.skipSubmitting.set(loading());
    this.onboardingService.setFormValue(this.stageForm.value);
    this.router.navigateByUrl(AppRoutes.onboarding.stage(stage));
    this.skipSubmitting.set(initial());
  }
}
