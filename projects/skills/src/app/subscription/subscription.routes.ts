/** @format */

import { Routes } from "@angular/router";
import { SubscriptionComponent } from "./subscription.component";
import { subscriptionDataResolver, subscriptionResolver } from "./subscription.resolver";

export const SUBSCRIPTION_ROUTES: Routes = [
  {
    path: "",
    component: SubscriptionComponent,
    resolve: {
      data: subscriptionResolver,
      subscriptionData: subscriptionDataResolver,
    },
  },
];
