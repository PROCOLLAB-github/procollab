/** @format */

import { Injectable, inject } from "@angular/core";
import { SkillsApiService, SubscriptionPlan } from "@corelib";

@Injectable({
  providedIn: "root",
})
export class SubscriptionService {
  apiService = inject(SkillsApiService);

  getSubscriptions() {
    return this.apiService.get<SubscriptionPlan[]>("/subscription/");
  }
}
