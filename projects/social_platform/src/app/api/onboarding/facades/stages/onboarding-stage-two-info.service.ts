/** @format */

import { inject, Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { concatMap, Subject, take, takeUntil } from "rxjs";
import { ValidationService } from "@corelib";
import { OnboardingService } from "../../onboarding.service";
import { Skill } from "projects/social_platform/src/app/domain/skills/skill";
import { SkillsInfoService } from "../../../skills/facades/skills-info.service";
import { OnboardingUIInfoService } from "./ui/onboarding-ui-info.service";
import { OnboardingStageTwoUIInfoService } from "./ui/onboarding-stage-two-ui-info.service";
import { AuthRepository } from "projects/social_platform/src/app/infrastructure/repository/auth/auth.repository";
import {
  failure,
  initial,
  loading,
} from "projects/social_platform/src/app/domain/shared/async-state";

@Injectable()
export class OnboardingStageTwoInfoService {
  private readonly authRepository = inject(AuthRepository);
  private readonly onboardingService = inject(OnboardingService);
  private readonly onboardingUIInfoService = inject(OnboardingUIInfoService);
  private readonly onboardingStageTwoUIInfoService = inject(OnboardingStageTwoUIInfoService);
  private readonly validationService = inject(ValidationService);
  private readonly router = inject(Router);
  private readonly skillsInfoService = inject(SkillsInfoService);

  private readonly destroy$ = new Subject<void>();

  private readonly stageForm = this.onboardingStageTwoUIInfoService.stageForm;

  private readonly stageSubmitting = this.onboardingUIInfoService.stageSubmitting;
  private readonly skipSubmitting = this.onboardingUIInfoService.skipSubmitting;

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

    this.authRepository
      .updateProfile({ skillsIds: skills.map((skill: Skill) => skill.id) })
      .pipe(
        concatMap(() => this.authRepository.updateOnboardingStage(2)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => this.completeRegistration(3),
        error: err => {
          this.stageSubmitting.set(failure("submit_error"));
          this.onboardingStageTwoUIInfoService.applySubmitErrorModal(err);
        },
      });
  }

  onAddSkill(newSkill: Skill): void {
    this.skillsInfoService.onAddSkill(newSkill, this.stageForm);
  }

  onRemoveSkill(oddSkill: Skill): void {
    this.skillsInfoService.onRemoveSkill(oddSkill, this.stageForm);
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
    this.skillsInfoService.onSearchSkill(query);
  }

  private completeRegistration(stage: number): void {
    this.skipSubmitting.set(loading());
    this.onboardingService.setFormValue(this.stageForm.value);
    this.router.navigateByUrl(`/office/onboarding/stage-${stage}`);
    this.skipSubmitting.set(initial());
  }
}
