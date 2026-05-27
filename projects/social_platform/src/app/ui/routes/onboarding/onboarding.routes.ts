/** @format */

import { Routes } from "@angular/router";
import { StageOneResolver } from "../../pages/onboarding/stage-one/stage-one.resolver";
import { OnboardingStageTwoComponent } from "../../pages/onboarding/stage-two/stage-two.component";
import { StageTwoResolver } from "../../pages/onboarding/stage-two/stage-two.resolver";
import { OnboardingComponent } from "@ui/pages/onboarding/onboarding.component";
import { OnboardingStageZeroComponent } from "@ui/pages/onboarding/stage-zero/stage-zero.component";
import { OnboardingStageOneComponent } from "@ui/pages/onboarding/stage-one/stage-one.component";
import { OnboardingStageThreeComponent } from "@ui/pages/onboarding/stage-three/stage-three.component";

/** Конфигурация маршрутов для онбординга. */
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
