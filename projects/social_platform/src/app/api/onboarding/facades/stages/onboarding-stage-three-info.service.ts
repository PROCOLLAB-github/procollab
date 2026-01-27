/** @format */

import { inject, Injectable } from "@angular/core";
import { concatMap, Subject, take, takeUntil } from "rxjs";
import { OnboardingService } from "../../onboarding.service";
import { AuthService } from "../../../auth";
import { Router } from "@angular/router";
import { OnboardingUIInfoService } from "./ui/onboarding-ui-info.service";
import { OnboardingStageThreeUIInfoService } from "./ui/onboarding-stage-three-ui-info.service";

@Injectable()
export class OnboardingStageThreeInfoService {
  private readonly onboardingService = inject(OnboardingService);
  private readonly onboardingUIInfoService = inject(OnboardingUIInfoService);
  private readonly onboardingStageThreeUIInfoService = inject(OnboardingStageThreeUIInfoService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

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

    this.authService
      .saveProfile({ userType: this.userRole() })
      .pipe(
        concatMap(() => this.authService.setOnboardingStage(null)),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.router
          .navigateByUrl("/office")
          .then(() => console.debug("Route changed from OnboardingStageTwo"));
      });
  }
}
