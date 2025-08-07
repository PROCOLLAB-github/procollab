/** @format */

import { Component, type OnDestroy, type OnInit, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { IconComponent } from "@uilib";
import { ButtonComponent } from "@ui/components";
import { SwitchComponent } from "@ui/components/switch/switch.component";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { ActivatedRoute } from "@angular/router";
import { toSignal } from "@angular/core/rxjs-interop";
import { map, type Subscription } from "rxjs";
import { ProfileService } from "../profile/services/profile.service";
import { type SubscriptionData, type SubscriptionPlan, SubscriptionPlansService } from "@corelib";

/**
 * Компонент управления подписками
 *
 * Предоставляет интерфейс для:
 * - Просмотра доступных планов подписки
 * - Покупки новой подписки
 * - Управления автопродлением
 * - Отмены текущей подписки
 *
 * Компонент обрабатывает различные модальные окна для подтверждения действий
 * и взаимодействует с API для выполнения операций с подписками
 */
@Component({
  selector: "app-subscription",
  standalone: true,
  imports: [CommonModule, IconComponent, ButtonComponent, SwitchComponent, ModalComponent],
  templateUrl: "./subscription.component.html",
  styleUrl: "./subscription.component.scss",
})
export class SubscriptionComponent implements OnInit, OnDestroy {
  // Сигналы для управления состоянием модальных окон
  open = signal(false);
  autoRenewModalOpen = signal(false);
  isSubscribedModalOpen = signal(false);

  // Внедрение зависимостей
  route = inject(ActivatedRoute);
  profileService = inject(ProfileService);
  subscriptionService = inject(SubscriptionPlansService);

  // Сигналы для данных подписки
  subscriptions = signal<SubscriptionPlan[]>([]);
  subscriptionData = toSignal<SubscriptionData>(
    this.route.data.pipe(map(r => r["subscriptionData"]))
  );

  isSubscribed = toSignal<SubscriptionData>(
    this.route.data.pipe(map(r => r["subscriptionData"].isSubscribed))
  );

  // Массив подписок для управления жизненным циклом
  subscription: Subscription[] = [];

  /**
   * Инициализация компонента
   *
   * Загружает данные о планах подписки из резолвера,
   * сортирует их по цене и устанавливает в локальное состояние
   */
  ngOnInit(): void {
    const subsriptionPlanSub = this.route.data
      .pipe(map(r => r["data"]))
      .pipe(
        map(subscription => {
          if (Array.isArray(subscription)) {
            return subscription;
          } else return [subscription];
        })
      )
      .pipe(map(subs => subs.sort((a, b) => a.price - b.price)))
      .subscribe(subscriptions => {
        this.subscriptions.set(subscriptions);
      });

    this.subscription.push(subsriptionPlanSub);
  }

  /**
   * Очистка ресурсов при уничтожении компонента
   */
  ngOnDestroy(): void {
    this.subscription.forEach(sub => sub.unsubscribe());
  }

  /**
   * Обработчик изменения состояния модальных окон
   *
   * @param event - новое состояние модального окна (открыто/закрыто)
   */
  onOpenChange(event: boolean) {
    if ((this.open() && !event) || (this.autoRenewModalOpen() && !event)) {
      this.open.set(false);
      this.autoRenewModalOpen.set(false);
    } else {
      this.open.set(event);
      this.autoRenewModalOpen.set(event);
    }
  }

  /**
   * Обработчик изменения настройки автопродления
   *
   * Если автопродление включено - отключает его,
   * если выключено - открывает модальное окно подтверждения
   */
  onCheckedChange() {
    if (this.subscriptionData()?.isAutopayAllowed) {
      this.profileService.updateSubscriptionDate(false).subscribe(() => {
        const updatedData = this.subscriptionData()!;
        updatedData.isAutopayAllowed = false;
      });
    } else {
      this.autoRenewModalOpen.set(true);
    }
  }

  /**
   * Обработчик закрытия модального окна отмены подписки
   *
   * @param event - состояние модального окна
   */
  onCancelModalClose(event: boolean) {
    if (!event) this.open.set(false);
  }

  /**
   * Обработчик закрытия модального окна автопродления
   *
   * @param event - состояние модального окна
   */
  onAutoRenewModalClose(event: boolean) {
    if (!event) this.autoRenewModalOpen.set(false);
  }

  /**
   * Открытие модального окна отмены подписки
   */
  openCancelModal() {
    this.open.set(true);
  }

  /**
   * Подтверждение настройки автопродления
   *
   * @param event - новое значение настройки автопродления
   */
  onConfirmAutoPlay(event: boolean) {
    this.profileService.updateSubscriptionDate(event).subscribe(() => {
      if (this.subscriptionData()) {
        const updatedData = this.subscriptionData()!;
        updatedData.isAutopayAllowed = event;
        this.autoRenewModalOpen.set(false);
        this.open.set(false);
      }
    });
  }

  /**
   * Отмена текущей подписки
   *
   * Выполняет запрос на отмену подписки и перезагружает страницу
   * для отображения обновленного состояния
   */
  onCancelSubscription() {
    this.profileService.cancelSubscription().subscribe({
      next: () => {
        this.open.set(false);
        location.reload();
      },
      error: () => {
        this.open.set(false);
        location.reload();
      },
    });
  }

  /**
   * Обработчик покупки подписки
   *
   * @param planId - идентификатор выбранного плана подписки
   *
   * Если пользователь не подписан - инициирует процесс покупки,
   * если уже подписан - показывает соответствующее уведомление
   */
  onBuyClick(planId: SubscriptionPlan["id"]) {
    if (!this.isSubscribed()) {
      this.subscriptionService.buySubscription(planId).subscribe(status => {
        location.href = status.confirmation.confirmationUrl;
      });
    } else {
      this.isSubscribedModalOpen.set(true);
    }
  }
}
