/** @format */

import { inject } from "@angular/core";
import { SubscriptionPlan } from "projects/skills/src/models/subscription.model";
import { SubscriptionPlansService } from "../../services/subscription-plans.service";
import { tap } from "rxjs";
import { ResolveFn } from "@angular/router";

export const subscriptionPlansResolver: ResolveFn<SubscriptionPlan[]> = () => {
  const subscriptionService = inject(SubscriptionPlansService)
  return subscriptionService.getSubscriptions().pipe(tap(console.log))
};
