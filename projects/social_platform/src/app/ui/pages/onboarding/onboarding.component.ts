/** @format */

import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router, RouterOutlet } from "@angular/router";
import { Subscription } from "rxjs";
import { OnboardingService } from "../../../api/onboarding/onboarding.service";

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
  imports: [RouterOutlet],
})
export class OnboardingComponent implements OnInit, OnDestroy {
  constructor(
    private readonly route: ActivatedRoute,
    private readonly onboardingService: OnboardingService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const stage$ = this.onboardingService.currentStage$.subscribe(s => {
      if (s === null) {
        this.router
          .navigateByUrl("/office")
          .then(() => console.debug("Route changed from OnboardingComponent"));
        return;
      }

      if (this.router.url.includes("stage")) {
        this.stage = Number.parseInt(this.router.url.split("-")[1]);
      } else {
        this.stage = s;
      }

      this.router
        .navigate([`stage-${this.stage}`], { relativeTo: this.route })
        .then(() => console.debug("Route changed from OnboardingComponent"));
    });

    this.updateStage();
    const events$ = this.router.events.subscribe(this.updateStage.bind(this));

    this.subscriptions$.push(stage$, events$);
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }

  stage = 0;
  activeStage = 0;

  subscriptions$: Subscription[] = [];

  updateStage(): void {
    this.activeStage = Number.parseInt(this.router.url.split("-")[1]);
    this.stage = Number.parseInt(this.router.url.split("-")[1]);
  }

  goToStep(stage: number): void {
    if (this.stage < stage) return;

    this.router
      .navigate([`stage-${stage}`], { relativeTo: this.route })
      .then(() => console.debug("Route changed from OnboardingComponent"));
  }
}
