/** @format */

import { inject, Injectable } from "@angular/core";
import { concatMap, Subject, take, takeUntil } from "rxjs";
import { OnboardingService } from "../../onboarding.service";
import { Router } from "@angular/router";
import { OnboardingUIInfoService } from "./ui/onboarding-ui-info.service";
import { OnboardingStageThreeUIInfoService } from "./ui/onboarding-stage-three-ui-info.service";
import { LoggerService } from "projects/core/src/lib/services/logger/logger.service";
import { AuthRepository } from "projects/social_platform/src/app/infrastructure/repository/auth/auth.repository";

@Injectable()
export class OnboardingStageThreeInfoService {
  private readonly onboardingService = inject(OnboardingService);
  private readonly onboardingUIInfoService = inject(OnboardingUIInfoService);
  private readonly onboardingStageThreeUIInfoService = inject(OnboardingStageThreeUIInfoService);
  private readonly authRepository = inject(AuthRepository);
  private readonly router = inject(Router);
  private readonly logger = inject(LoggerService);

  private readonly destroy$ = new Subject<void>();

  private readonly userRole = this.onboardingStageThreeUIInfoService.userRole;

  private readonly stageTouched = this.onboardingUIInfoService.stageTouched;
  private readonly stageSubmitting = this.onboardingUIInfoService.stageSubmitting;

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializationFormValues(): void {
    this.onboardingService.formValue$.pipe(take(1), takeUntil(this.destroy$)).subscribe(fv => {
      this.onboardingStageThreeUIInfoService.applyInitFormValues(fv);
    });
  }

  onSubmit() {
    if (this.userRole() === -1) {
      this.stageTouched.set(true);
      return;
    }

    this.stageSubmitting.set(true);

    this.authRepository
      .updateProfile({ userType: this.userRole() })
      .pipe(
        concatMap(() => this.authRepository.updateOnboardingStage(null)),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.router
          .navigateByUrl("/office")
          .then(() => this.logger.debug("Route changed from OnboardingStageTwo"));
      });
  }
}
