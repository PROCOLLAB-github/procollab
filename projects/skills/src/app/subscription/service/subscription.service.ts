/** @format */

import { Injectable, inject } from "@angular/core";
import { SkillsApiService, SubscriptionPlan } from "@corelib";

/**
 * Сервис для работы с API подписок. Предоставляет методы для
 * получения информации о доступных планах подписки.
 */
@Injectable({
  providedIn: "root",
})
export class SubscriptionService {
  private readonly SUBSCRIPTION_URL = "/subscription";

  apiService = inject(SkillsApiService);

  /**
   * Получение списка всех доступных планов подписки
   * @returns Observable<SubscriptionPlan[]> - массив планов подписки
   *
   * Ошибки обрабатываются на уровне компонентов
   * Пример использования: this.subscriptionService.getSubscriptions();
   */
  getSubscriptions() {
    return this.apiService.get<SubscriptionPlan[]>(`${this.SUBSCRIPTION_URL}/`);
  }
}
