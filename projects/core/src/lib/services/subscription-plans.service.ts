/** @format */

import { Injectable, inject } from "@angular/core";
import { SkillsApiService } from "@corelib";
import { PaymentStatus, SubscriptionPlan } from "../models";

@Injectable({
  providedIn: "root",
})
export class SubscriptionPlansService {
  apiService = inject(SkillsApiService);

  getSubscriptions() {
    return this.apiService.get<SubscriptionPlan[]>("/auth/subscription/");
  }

  buySubscription(planId: SubscriptionPlan["id"]) {
    return this.apiService.post<PaymentStatus>("/subscription/buy/", {
      subscriptionId: planId,
      redirectUrl: `${window.location.origin}/`,
    });
  }
}
