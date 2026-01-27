/** @format */

import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { ButtonComponent } from "@ui/components";
import { UserTypeCardComponent } from "@ui/shared/user-type-card/user-type-card.component";
import { OnboardingStageThreeUIInfoService } from "projects/social_platform/src/app/api/onboarding/facades/stages/ui/onboarding-stage-three-ui-info.service";
import { OnboardingStageThreeInfoService } from "projects/social_platform/src/app/api/onboarding/facades/stages/onboarding-stage-three-info.service";
import { OnboardingUIInfoService } from "projects/social_platform/src/app/api/onboarding/facades/stages/ui/onboarding-ui-info.service";

/**
 * КОМПОНЕНТ ТРЕТЬЕГО ЭТАПА ОНБОРДИНГА
 *
 * Назначение: Финальный этап онбординга - выбор роли пользователя (ментор или менти)
 *
 * Что делает:
 * - Отображает интерфейс для выбора типа пользователя
 * - Валидирует выбор роли перед отправкой
 * - Сохраняет выбранную роль в профиле пользователя
 * - Завершает процесс онбординга и перенаправляет в основное приложение
 * - Управляет состоянием загрузки и ошибок
 *
 * Что принимает:
 * - Данные из OnboardingService (текущее состояние формы)
 * - Взаимодействие пользователя (выбор роли, отправка формы)
 *
 * Что возвращает:
 * - Визуальный интерфейс с карточками выбора роли
 * - Навигацию в основное приложение после успешного завершения
 *
 * Состояния компонента:
 * - userRole: выбранная роль (-1 = не выбрана, другие значения = конкретная роль)
 * - stageTouched: флаг попытки отправки без выбора роли
 * - stageSubmitting: флаг процесса отправки данных
 */
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
  standalone: true,
})
export class OnboardingStageThreeComponent implements OnInit, OnDestroy {
  private readonly onboardingStageThreeInfoService = inject(OnboardingStageThreeInfoService);
  private readonly onboardingStageThreeUIInfoService = inject(OnboardingStageThreeUIInfoService);
  private readonly onboardingUIInfoService = inject(OnboardingUIInfoService);

  protected readonly userRole = this.onboardingStageThreeUIInfoService.userRole;
  protected readonly stageTouched = this.onboardingUIInfoService.stageTouched;
  protected readonly stageSubmitting = this.onboardingUIInfoService.stageSubmitting;

  ngOnInit(): void {
    this.onboardingStageThreeInfoService.initializationFormValues();
  }

  ngOnDestroy(): void {
    this.onboardingStageThreeInfoService.destroy();
  }

  onSetRole(role: number) {
    this.onboardingStageThreeUIInfoService.applySetRole(role);
  }

  onSubmit() {
    this.onboardingStageThreeInfoService.onSubmit();
  }
}
