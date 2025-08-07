/** @format */

import { Component, EventEmitter, inject, Input, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { IconComponent } from "@uilib";
import { ButtonComponent, CheckboxComponent } from "@ui/components";
import { Router, RouterLink } from "@angular/router";
import { type SubscriptionPlan, SubscriptionPlansService } from "@corelib";

/**
 * Компонент модального окна с планами подписки
 *
 * Отображает доступные тарифные планы с их особенностями и ценами.
 * Позволяет пользователю выбрать и купить подписку.
 * Включает чекбокс согласия с офертой.
 *
 * @example
 * \`\`\`html
 * <app-subscription-plans
 *   [open]="showPlansModal"
 *   [subscriptionPlans]="availablePlans"
 *   (openChange)="onModalStateChange($event)">
 * </app-subscription-plans>
 * \`\`\`
 */
@Component({
  selector: "app-subscription-plans",
  standalone: true,
  imports: [CommonModule, IconComponent, ButtonComponent, RouterLink, CheckboxComponent],
  templateUrl: "./subscription-plans.component.html",
  styleUrl: "./subscription-plans.component.scss",
})
export class SubscriptionPlansComponent {
  /** Сервис роутинга Angular */
  router = inject(Router);

  /** Сервис для работы с подписками */
  subscriptionService = inject(SubscriptionPlansService);

  /** Флаг согласия с офертой */
  offertAgreement = false;

  /** Флаг открытия модального окна */
  @Input() open = false;

  /** Массив доступных планов подписки */
  @Input({ required: true }) subscriptionPlans!: SubscriptionPlan[];

  /** Событие изменения состояния модального окна */
  @Output() openChange = new EventEmitter<boolean>();

  /**
   * Обработчик покупки подписки
   * Инициирует процесс покупки выбранного плана
   *
   * @param planId - ID выбранного плана подписки
   */
  onBuyClick(planId: SubscriptionPlan["id"]) {
    this.subscriptionService.buySubscription(planId).subscribe(status => {
      // Перенаправляем пользователя на страницу оплаты
      location.href = status.confirmation.confirmationUrl;
    });
  }
}
