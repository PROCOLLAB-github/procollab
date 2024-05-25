/** @format */

import { Injectable, inject } from "@angular/core";
import { ApiService } from "@corelib";
import { SubscriptionPlan } from "projects/skills/src/models/subscription.model";
import { PaymentStatus } from "../../../models/profile.model";

@Injectable({
  providedIn: "root",
})
export class SubscriptionPlansService {
  apiService = inject(ApiService);

  getSubscriptions() {
    return this.apiService.get<SubscriptionPlan[]>("/subscription");
  }

  buySubscription(planId: SubscriptionPlan["id"]) {
    return this.apiService.post<PaymentStatus>("/subscription/buy", {
      subscriptionId: planId,
      redirectUrl: `${window.location.origin}/profile`,
    });
  }
}
