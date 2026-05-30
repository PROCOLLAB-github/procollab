/** @format */

import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router, RouterOutlet } from "@angular/router";
import { Subscription } from "rxjs";
import { OnboardingService } from "@api/onboarding/onboarding.service";
import { OnboardingInfoService } from "@api/onboarding/facades/onboarding-info.service";
import { OnboardingUIInfoService } from "@api/onboarding/facades/stages/ui/onboarding-ui-info.service";

/** Контейнер и координатор этапов онбординга — управляет навигацией и последовательностью прохождения. */
@Component({
    selector: "app-onboarding",
    templateUrl: "./onboarding.component.html",
    styleUrl: "./onboarding.component.scss",
    providers: [OnboardingInfoService, OnboardingUIInfoService],
    imports: [RouterOutlet],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OnboardingComponent implements OnInit, OnDestroy {
  private readonly onboardingInfoService = inject(OnboardingInfoService);
  private readonly onboardingUIInfoService = inject(OnboardingUIInfoService);

  protected readonly stage = this.onboardingInfoService.stage;
  protected readonly activeStage = this.onboardingInfoService.activeStage;

  ngOnInit(): void {
    this.onboardingInfoService.initializationOnboarding();
  }

  ngOnDestroy(): void {
    this.onboardingInfoService.destroy();
  }

  updateStage(): void {
    this.onboardingInfoService.updateStage();
  }

  goToStep(stage: number): void {
    this.onboardingInfoService.goToStep(stage);
  }
}
