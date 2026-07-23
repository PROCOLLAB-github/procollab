/** @format */

import { DestroyRef, inject, Injectable } from "@angular/core";
import { concatMap, of, take, tap } from "rxjs";
import { OnboardingService } from "../../onboarding.service";
import { Router } from "@angular/router";
import { OnboardingUIInfoService } from "./ui/onboarding-ui-info.service";
import { OnboardingStageThreeUIInfoService } from "./ui/onboarding-stage-three-ui-info.service";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { UpdateProfileUseCase } from "@api/auth/use-cases/update-profile.use-case";
import { UpdateOnboardingStageUseCase } from "@api/auth/use-cases/update-onboarding-stage.use-case";
import { failure, loading } from "@domain/shared/async-state";
import { AppRoutes } from "@api/paths/app-routes";
import { ProfileInfoService } from "@api/profile/facades/profile-info.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { isValidProfileId } from "@domain/auth/profile-id";

/** Фасад этапа 3 онбординга: обновление профиля и продвижение этапа онбординга. */
@Injectable()
export class OnboardingStageThreeInfoService {
  private readonly router = inject(Router);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly onboardingService = inject(OnboardingService);
  private readonly onboardingUIInfoService = inject(OnboardingUIInfoService);
  private readonly onboardingStageThreeUIInfoService = inject(OnboardingStageThreeUIInfoService);
  private readonly profileInfoService = inject(ProfileInfoService);

  private readonly updateProfileUseCase = inject(UpdateProfileUseCase);
  private readonly updateOnboardingStageUseCase = inject(UpdateOnboardingStageUseCase);

  private readonly userRole = this.onboardingStageThreeUIInfoService.userRole;
  private readonly profile = this.profileInfoService.profile;

  private readonly stageTouched = this.onboardingUIInfoService.stageTouched;
  private readonly stageSubmitting = this.onboardingUIInfoService.stageSubmitting$;

  initializationFormValues(): void {
    this.onboardingService.formValue$
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe(fv => {
        this.onboardingStageThreeUIInfoService.applyInitFormValues(fv);
      });
  }

  onSubmit() {
    if (this.userRole() === -1) {
      this.stageTouched.set(true);
      return;
    }

    const profile = this.profile();
    if (!isValidProfileId(profile?.id)) {
      this.stageSubmitting.set(failure("submit_error"));
      return;
    }

    this.stageSubmitting.set(loading());

    this.updateProfileUseCase
      .execute(profile.id, { userType: this.userRole() })
      .pipe(
        concatMap(result =>
          result.ok ? this.updateOnboardingStageUseCase.execute(null, profile.id) : of(result),
        ),
        tap(result => {
          if (!result.ok) return;
          this.profileInfoService.applyProfileUpdated(result.value);
          this.router
            .navigateByUrl(AppRoutes.office.root())
            .then(() => this.logger.debug("Route changed from OnboardingStageThree"));
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }
}
