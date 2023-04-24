/** @format */

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { OnboardingComponent } from "./onboarding/onboarding.component";
import { OnboardingStageZeroComponent } from "@office/onboarding/stage-zero/onboarding-stage-zero.component";
import { OnboardingRoutingModule } from "@office/onboarding/onboarding-routing.module";
import { CoreModule } from "@core/core.module";
import { ReactiveFormsModule } from "@angular/forms";
import { UiModule } from "@ui/ui.module";

@NgModule({
  declarations: [OnboardingComponent, OnboardingStageZeroComponent],
  imports: [CommonModule, OnboardingRoutingModule, CoreModule, ReactiveFormsModule, UiModule],
})
export class OnboardingModule {}
