/** @format */

import { Component, inject, type OnDestroy, type OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MonthBlockComponent } from "../shared/month-block/month-block.component";
import { SkillsBlockComponent } from "../shared/skills-block/skills-block.component";
import { ProgressBlockComponent } from "../shared/progress-block/progress-block.component";
import { ActivatedRoute } from "@angular/router";
import { toSignal } from "@angular/core/rxjs-interop";
import { map, type Subscription } from "rxjs";
import { mockMonthsList } from "projects/core/src/consts/list-mock-months";
import { ProfileService } from "../services/profile.service";
import { TrajectoryBlockComponent } from "../shared/trajectory-block/trajectory-block.component";

/**
 * Компонент главной страницы профиля пользователя
 *
 * Отображает основную информацию профиля в зависимости от статуса подписки:
 * - Для пользователей без подписки: календарь месячной активности
 * - Для подписчиков: блок траекторий обучения
 *
 * Также включает блоки навыков и общего прогресса пользователя.
 *
 * Компонент автоматически определяет тип отображения на основе
 * статуса подписки пользователя.
 */
@Component({
  selector: "app-skills",
  standalone: true,
  imports: [
    CommonModule,
    MonthBlockComponent,
    SkillsBlockComponent,
    ProgressBlockComponent,
    TrajectoryBlockComponent,
  ],
  templateUrl: "./profile-home.component.html",
  styleUrl: "./profile-home.component.scss",
})
export class ProfileHomeComponent implements OnInit, OnDestroy {
  // Моковые данные для календаря месяцев (временное решение)
  readonly mockMonts = mockMonthsList;

  // Внедрение зависимостей
  private readonly route = inject(ActivatedRoute);
  private readonly profileService = inject(ProfileService);

  /**
   * Данные профиля пользователя из резолвера
   * Содержат информацию о пользователе, навыках и прогрессе
   */
  profileData = toSignal(this.route.data.pipe(map(r => r["data"])));

  /**
   * Тип отображения основного блока:
   * - 'months' - календарь месячной активности (для бесплатных пользователей)
   * - 'trajectory' - блок траекторий (для подписчиков)
   */
  type: "months" | "trajectory" = "months";

  // Массив подписок для управления жизненным циклом
  subscription$: Subscription[] = [];

  /**
   * Инициализация компонента
   *
   * Определяет тип отображения на основе статуса подписки пользователя.
   * Подписчики видят траектории обучения, остальные - календарь активности.
   */
  ngOnInit(): void {
    const isSubscribedSub$ = this.profileService.getSubscriptionData().subscribe(r => {
      this.type = r.isSubscribed ? "trajectory" : "months";
    });

    isSubscribedSub$ && this.subscription$.push(isSubscribedSub$);
  }

  /**
   * Очистка ресурсов при уничтожении компонента
   */
  ngOnDestroy(): void {
    this.subscription$.forEach($ => $.unsubscribe());
  }
}
