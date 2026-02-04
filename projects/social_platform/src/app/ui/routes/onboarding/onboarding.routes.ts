/** @format */

import { Routes } from "@angular/router";
import { StageOneResolver } from "../../pages/onboarding/stage-one/stage-one.resolver";
import { OnboardingStageTwoComponent } from "../../pages/onboarding/stage-two/stage-two.component";
import { StageTwoResolver } from "../../pages/onboarding/stage-two/stage-two.resolver";
import { OnboardingComponent } from "@ui/pages/onboarding/onboarding.component";
import { OnboardingStageZeroComponent } from "@ui/pages/onboarding/stage-zero/stage-zero.component";
import { OnboardingStageOneComponent } from "@ui/pages/onboarding/stage-one/stage-one.component";
import { OnboardingStageThreeComponent } from "@ui/pages/onboarding/stage-three/stage-three.component";

/**
 * ФАЙЛ МАРШРУТИЗАЦИИ ОНБОРДИНГА
 *
 * Назначение: Определяет структуру маршрутов для процесса онбординга новых пользователей
 *
 * Что делает:
 * - Настраивает иерархию маршрутов для 4 этапов онбординга (stage-0, stage-1, stage-2, stage-3)
 * - Связывает каждый маршрут с соответствующим компонентом
 * - Подключает резолверы для предзагрузки данных на этапах 1 и 2
 *
 * Что принимает: Нет входных параметров (статическая конфигурация)
 *
 * Что возвращает: Массив Routes для Angular Router
 *
 * Структура этапов:
 * - stage-0: Базовая информация профиля (фото, город, образование, опыт работы)
 * - stage-1: Выбор специализации пользователя
 * - stage-2: Выбор навыков пользователя
 * - stage-3: Выбор типа пользователя (ментор/менти)
 */
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
