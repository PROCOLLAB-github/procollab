/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Subject, takeUntil } from "rxjs";
import { OnboardingService } from "../onboarding.service";

@Injectable()
export class OnboardingInfoService {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly onboardingService = inject(OnboardingService);

  readonly stage = signal<number>(0);
  readonly activeStage = signal<number>(0);

  private readonly destroy$ = new Subject<void>();

  initializationOnboarding(): void {
    this.onboardingService.currentStage$.pipe(takeUntil(this.destroy$)).subscribe(s => {
      if (s === null) {
        this.router
          .navigateByUrl("/office")
          .then(() => console.debug("Route changed from OnboardingComponent"));
        return;
      }

      if (this.router.url.includes("stage")) {
        this.stage.set(Number.parseInt(this.router.url.split("-")[1]));
      } else {
        this.stage.set(s);
      }

      this.router
        .navigate([`stage-${this.stage()}`], { relativeTo: this.route })
        .then(() => console.debug("Route changed from OnboardingComponent"));
    });

    this.updateStage();

    this.router.events.pipe(takeUntil(this.destroy$)).subscribe(this.updateStage.bind(this));
  }

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  updateStage(): void {
    this.activeStage.set(Number.parseInt(this.router.url.split("-")[1]));
    this.stage.set(Number.parseInt(this.router.url.split("-")[1]));
  }

  goToStep(stage: number): void {
    if (this.stage() < stage) return;

    this.router
      .navigate([`stage-${stage}`], { relativeTo: this.route })
      .then(() => console.debug("Route changed from OnboardingComponent"));
  }
}
