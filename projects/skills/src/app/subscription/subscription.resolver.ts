/** @format */

import { inject } from "@angular/core";
import { SubscriptionService } from "./service/subscription.service";
import { ProfileService } from "../profile/services/profile.service";

/**
 * Резолвер для получения списка доступных планов подписки
 *
 * Выполняется перед загрузкой компонента подписки и предоставляет
 * данные о всех доступных тарифных планах
 *
 * @returns Observable с массивом планов подписки
 */
export const subscriptionResolver = () => {
  const subscriptionService = inject(SubscriptionService);
  return subscriptionService.getSubscriptions();
};

/**
 * Резолвер для получения данных о текущей подписке пользователя
 *
 * Загружает информацию о статусе подписки, дате окончания,
 * настройках автопродления и других параметрах
 *
 * @returns Observable с данными подписки пользователя
 */
export const subscriptionDataResolver = () => {
  const profileService = inject(ProfileService);
  return profileService.getSubscriptionData();
};
