import { Injectable, inject } from "@angular/core";
import { ApiService } from "@corelib";
import { SubscriptionPlan } from "projects/skills/src/models/subscription.model";

@Injectable({
  providedIn: 'root'
})

export class SubscriptionPlansService {
  apiService = inject(ApiService);

  getSubscriptions() {
    return this.apiService.get<SubscriptionPlan[]>('/subscription');
  }
}
