/** @format */

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { OnboardingComponent } from "./onboarding/onboarding.component";
import { OnboardingStageZeroComponent } from "@office/onboarding/stage-zero/onboarding-stage-zero.component";
import { RouterModule } from "@angular/router";
import { OnboardingRoutingModule } from "@office/onboarding/onboarding-routing.module";

@NgModule({
  declarations: [OnboardingComponent, OnboardingStageZeroComponent],
  imports: [CommonModule, OnboardingRoutingModule],
})
export class OnboardingModule {}
