/** @format */

import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router, RouterOutlet } from "@angular/router";
import { Subscription } from "rxjs";
import { OnboardingService } from "../../../api/onboarding/onboarding.service";
import { OnboardingInfoService } from "../../../api/onboarding/facades/onboarding-info.service";
import { OnboardingUIInfoService } from "../../../api/onboarding/facades/stages/ui/onboarding-ui-info.service";

/**
 * ОСНОВНОЙ КОМПОНЕНТ ОНБОРДИНГА
 *
 * Назначение: Контейнер и координатор для всех этапов процесса онбординга
 *
 * Что делает:
 * - Управляет навигацией между этапами онбординга (stage-0 до stage-3)
 * - Отслеживает текущий и активный этапы процесса
 * - Обеспечивает правильную последовательность прохождения этапов
 * - Предоставляет интерфейс для перехода к предыдущим этапам
 * - Автоматически перенаправляет в основное приложение при завершении
 * - Синхронизирует состояние с OnboardingService
 *
 * Что принимает:
 * - Данные о текущем этапе из OnboardingService.currentStage$
 * - События навигации от Angular Router
 * - Пользовательские действия (клики по этапам)
 *
 * Что возвращает:
 * - Контейнер с индикатором прогресса этапов
 * - RouterOutlet для отображения компонентов текущего этапа
 * - Навигационные элементы для перехода между этапами
 *
 * Логика навигации:
 * - stage: текущий этап из URL
 * - activeStage: этап, отображаемый в UI
 * - Запрет перехода на будущие этапы (stage < targetStage)
 * - Автоматическое перенаправление при currentStage$ = null
 *
 * Состояния этапов:
 * - 0: Базовая информация профиля
 * - 1: Выбор специализации
 * - 2: Выбор навыков
 * - 3: Выбор роли пользователя
 * - null: Онбординг завершен, переход в /office
 */
@Component({
  selector: "app-onboarding",
  templateUrl: "./onboarding.component.html",
  styleUrl: "./onboarding.component.scss",
  standalone: true,
  providers: [OnboardingInfoService, OnboardingUIInfoService],
  imports: [RouterOutlet],
})
export class OnboardingComponent implements OnInit, OnDestroy {
  private readonly onboardingInfoService = inject(OnboardingInfoService);
  private readonly onboardingUIInfoService = inject(OnboardingUIInfoService);

  protected readonly stage = this.onboardingInfoService.stage;
  protected readonly activeStage = this.onboardingInfoService.activeStage;

  ngOnInit(): void {
    this.onboardingInfoService.initializationOnboarding();
  }

  ngOnDestroy(): void {
    this.onboardingInfoService.destroy();
  }

  updateStage(): void {
    this.onboardingInfoService.updateStage();
  }

  goToStep(stage: number): void {
    this.onboardingInfoService.goToStep(stage);
  }
}
