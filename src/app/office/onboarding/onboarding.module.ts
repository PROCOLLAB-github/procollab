/** @format */

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { OnboardingComponent } from "./onboarding/onboarding.component";
import { OnboardingStageZeroComponent } from "@office/onboarding/stage-zero/stage-zero.component";
import { OnboardingRoutingModule } from "@office/onboarding/onboarding-routing.module";
import { CoreModule } from "@core/core.module";
import { ReactiveFormsModule } from "@angular/forms";
import { UiModule } from "@ui/ui.module";
import { OnboardingStageOneComponent } from "./stage-one/stage-one.component";
import { OnboardingStageTwoComponent } from "./stage-two/stage-two.component";
import { UserTypeCardComponent } from './user-type-card/user-type-card.component';

@NgModule({
    imports: [CommonModule, OnboardingRoutingModule, CoreModule, ReactiveFormsModule, UiModule, OnboardingComponent,
        OnboardingStageZeroComponent,
        OnboardingStageOneComponent,
        OnboardingStageTwoComponent,
        UserTypeCardComponent],
})
export class OnboardingModule {}
