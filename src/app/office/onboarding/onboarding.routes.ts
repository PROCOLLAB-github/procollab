/** @format */

import { Routes } from "@angular/router";
import { OnboardingComponent } from "@office/onboarding/onboarding/onboarding.component";
import { OnboardingStageZeroComponent } from "@office/onboarding/stage-zero/stage-zero.component";
import { OnboardingStageOneComponent } from "@office/onboarding/stage-one/stage-one.component";
import { OnboardingStageTwoComponent } from "@office/onboarding/stage-two/stage-two.component";

export const ONBOARDING_ROUTES: Routes = [
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
      {
        path: "stage-2",
        component: OnboardingStageTwoComponent,
      },
    ],
  },
];
