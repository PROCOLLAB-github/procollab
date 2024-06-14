/** @format */

import { Injectable, inject } from "@angular/core";
import { ApiService, SubscriptionPlan } from "@corelib";

@Injectable({
  providedIn: "root",
})
export class SubscriptionService {
  apiService = inject(ApiService);

  getSubscriptions() {
    return this.apiService.get<SubscriptionPlan[]>("/subscription/");
  }
}
