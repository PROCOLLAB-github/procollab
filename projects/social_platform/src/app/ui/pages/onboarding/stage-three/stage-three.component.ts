/** @format */

import { ChangeDetectionStrategy, Component, inject, OnInit } from "@angular/core";
import { ButtonComponent } from "@ui/primitives";
import { UserTypeCardComponent } from "./user-type-card/user-type-card.component";
import { OnboardingStageThreeUIInfoService } from "@api/onboarding/facades/stages/ui/onboarding-stage-three-ui-info.service";
import { OnboardingStageThreeInfoService } from "@api/onboarding/facades/stages/onboarding-stage-three-info.service";
import { OnboardingUIInfoService } from "@api/onboarding/facades/stages/ui/onboarding-ui-info.service";

/** Финальный этап онбординга — выбор роли пользователя. */
@Component({
  selector: "app-stage-three",
  templateUrl: "./stage-three.component.html",
  styleUrl: "./stage-three.component.scss",
  imports: [UserTypeCardComponent, ButtonComponent],
  providers: [
    OnboardingStageThreeInfoService,
    OnboardingStageThreeUIInfoService,
    OnboardingUIInfoService,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnboardingStageThreeComponent implements OnInit {
  private readonly onboardingStageThreeInfoService = inject(OnboardingStageThreeInfoService);
  private readonly onboardingStageThreeUIInfoService = inject(OnboardingStageThreeUIInfoService);
  private readonly onboardingUIInfoService = inject(OnboardingUIInfoService);

  protected readonly userRole = this.onboardingStageThreeUIInfoService.userRole;
  protected readonly stageTouched = this.onboardingUIInfoService.stageTouched;
  protected readonly stageSubmitting = this.onboardingUIInfoService.stageSubmitting;

  ngOnInit(): void {
    this.onboardingStageThreeInfoService.initializationFormValues();
  }

  onSetRole(role: number) {
    this.onboardingStageThreeUIInfoService.applySetRole(role);
  }

  onSubmit() {
    this.onboardingStageThreeInfoService.onSubmit();
  }
}
