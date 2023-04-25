/** @format */

import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { OnboardingComponent } from "@office/onboarding/onboarding/onboarding.component";
import { OnboardingStageZeroComponent } from "@office/onboarding/stage-zero/stage-zero.component";
import { OnboardingStageOneComponent } from "@office/onboarding/stage-one/stage-one.component";

const routes: Routes = [
  {
    path: "",
    component: OnboardingComponent,
    children: [
      {
        path: "stage-0",
        component: OnboardingStageZeroComponent,
      },
      {
        path: "stage-1",
        component: OnboardingStageOneComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OnboardingRoutingModule {}
