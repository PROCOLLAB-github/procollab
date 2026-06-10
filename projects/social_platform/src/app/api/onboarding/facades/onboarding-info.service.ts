/** @format */

import { DestroyRef, inject, Injectable, signal } from "@angular/core";
import { Router } from "@angular/router";
import { OnboardingService } from "../onboarding.service";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { AppRoutes } from "@api/paths/app-routes";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

/** Фасад онбординга: текущий/активный этап, навигация по шагам. */
@Injectable()
export class OnboardingInfoService {
  private readonly router = inject(Router);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly onboardingService = inject(OnboardingService);

  readonly stage = signal<number>(0);
  readonly activeStage = signal<number>(0);

  initializationOnboarding(): void {
    this.onboardingService.currentStage$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(s => {
      if (s === null) {
        this.router
          .navigateByUrl(AppRoutes.office.root())
          .then(() => this.logger.debug("Route changed from OnboardingComponent"));
        return;
      }

      if (this.router.url.includes("stage")) {
        this.stage.set(Number.parseInt(this.router.url.split("-")[1]));
      } else {
        this.stage.set(s);
      }

      this.router
        .navigateByUrl(AppRoutes.onboarding.stage(this.stage()))
        .then(() => this.logger.debug("Route changed from OnboardingComponent"));
    });

    this.updateStage();

    this.router.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(this.updateStage.bind(this));
  }

  updateStage(): void {
    this.activeStage.set(Number.parseInt(this.router.url.split("-")[1]));
    this.stage.set(Number.parseInt(this.router.url.split("-")[1]));
  }

  goToStep(stage: number): void {
    if (this.stage() < stage) return;

    this.router
      .navigateByUrl(AppRoutes.onboarding.stage(stage))
      .then(() => this.logger.debug("Route changed from OnboardingComponent"));
  }
}
