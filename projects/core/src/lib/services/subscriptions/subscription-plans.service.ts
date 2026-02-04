/** @format */

import { Injectable, inject } from "@angular/core";
import { PaymentStatus, SubscriptionPlan } from "../../models";
import { SkillsApiService } from "../api/skillsApi.service";

/**
 * Сервис для управления планами подписок и платежами
 *
 * Функциональность:
 * - Получение списка доступных планов подписок
 * - Инициация процесса покупки подписки
 * - Работа с платежной системой (возврат статуса платежа)
 *
 * Интеграция:
 * - Использует SkillsApiService для взаимодействия с Skills API
 * - Работает с моделями SubscriptionPlan и PaymentStatus
 * - Поддерживает redirect URL для возврата после оплаты
 *
 * Бизнес-логика:
 * - Получает актуальные планы подписок с сервера
 * - Создает платежные сессии для выбранных планов
 * - Обрабатывает redirect URL для возврата пользователя после оплаты
 */
@Injectable({
  providedIn: "root",
})
export class SubscriptionPlansService {
  private readonly AUTH_SUBSCRIPTION_URL = "/auth/subscription";
  private readonly SUBSCRIPTION_URL = "/subscription";

  /** Инжектируем SkillsApiService для работы с API */
  private apiService = inject(SkillsApiService);

  /**
   * Получает список всех доступных планов подписок
   * @returns Observable с массивом планов подписок
   *
   * Возвращаемые данные включают:
   * - id: уникальный идентификатор плана
   * - name: название плана
   * - price: стоимость подписки
   * - featuresList: список возможностей плана
   * - active: активен ли план
   * - available: доступен ли план для покупки
   *
   * Пример использования:
   * subscriptionService.getSubscriptions().subscribe(plans => {
   *   console.log('Available plans:', plans);
   * });
   */
  getSubscriptions() {
    return this.apiService.get<SubscriptionPlan[]>(`${this.AUTH_SUBSCRIPTION_URL}/`);
  }

  /**
   * Инициирует процесс покупки подписки
   * @param planId - ID выбранного плана подписки
   * @returns Observable со статусом платежа и URL для подтверждения
   *
   * Процесс покупки:
   * 1. Отправляет запрос на создание платежной сессии
   * 2. Получает URL для перенаправления на платежную систему
   * 3. Возвращает статус платежа с confirmation URL
   *
   * Возвращаемые данные включают:
   * - id: идентификатор платежа
   * - status: статус платежа
   * - amount: сумма и валюта
   * - confirmation.confirmationUrl: URL для подтверждения платежа
   * - paid: флаг успешной оплаты
   *
   * Пример использования:
   * subscriptionService.buySubscription(planId).subscribe(payment => {
   *   window.location.href = payment.confirmation.confirmationUrl;
   * });
   */
  buySubscription(planId: SubscriptionPlan["id"]) {
    return this.apiService.post<PaymentStatus>(`${this.SUBSCRIPTION_URL}/buy/`, {
      subscriptionId: planId,
      // Автоматически определяем URL для возврата после оплаты
      redirectUrl: `${window.location.origin}/`,
    });
  }
}
