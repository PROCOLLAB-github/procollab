/** @format */

import { Routes } from "@angular/router";
import { OnboardingComponent } from "@office/onboarding/onboarding/onboarding.component";
import { OnboardingStageZeroComponent } from "@office/onboarding/stage-zero/stage-zero.component";
import { OnboardingStageOneComponent } from "@office/onboarding/stage-one/stage-one.component";
import { OnboardingStageThreeComponent } from "@office/onboarding/stage-three/stage-three.component";
import { StageOneResolver } from "./stage-one/stage-one.resolver";
import { OnboardingStageTwoComponent } from "./stage-two/stage-two.component";
import { StageTwoResolver } from "./stage-two/stage-two.resolver";

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
        resolve: {
          data: StageOneResolver,
        },
      },
      {
        path: "stage-2",
        component: OnboardingStageTwoComponent,
        resolve: {
          data: StageTwoResolver,
        },
      },
      {
        path: "stage-3",
        component: OnboardingStageThreeComponent,
      },
    ],
  },
];
