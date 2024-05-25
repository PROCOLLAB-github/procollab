/** @format */

import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { IconComponent } from "@uilib";
import { ButtonComponent } from "@ui/components";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { map, Observable } from "rxjs";
import { SubscriptionPlan } from "../../../../models/subscription.model";
import { SubscriptionPlansService } from "../../services/subscription-plans.service";

@Component({
  selector: "app-subscription-plans",
  standalone: true,
  imports: [CommonModule, IconComponent, ButtonComponent, RouterLink],
  templateUrl: "./subscription-plans.component.html",
  styleUrl: "./subscription-plans.component.scss",
})
export class SubscriptionPlansComponent {
  route = inject(ActivatedRoute);
  router = inject(Router);
  subscriptionService = inject(SubscriptionPlansService);

  subscriptionPlans = this.route.data.pipe(map(r => r["data"])) as Observable<SubscriptionPlan[]>;

  onBuyClick(planId: SubscriptionPlan["id"]) {
    this.subscriptionService.buySubscription(planId).subscribe(status => {
      location.href = status.confirmation.confirmationUrl;
    });
  }
}
