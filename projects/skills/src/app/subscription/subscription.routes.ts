/** @format */

import type { Routes } from "@angular/router";
import { SubscriptionComponent } from "./subscription.component";
import { subscriptionDataResolver, subscriptionResolver } from "./subscription.resolver";

export const SUBSCRIPTION_ROUTES: Routes = [
  {
    path: "",
    component: SubscriptionComponent,
    resolve: {
      data: subscriptionResolver, // Список всех доступных планов подписки
      subscriptionData: subscriptionDataResolver, // Данные текущей подписки пользователя
    },
  },
];
