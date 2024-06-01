/** @format */

import { Component, EventEmitter, inject, Input, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { IconComponent } from "@uilib";
import { ButtonComponent } from "@ui/components";
import { Router, RouterLink } from "@angular/router";
import { SubscriptionPlan, SubscriptionPlansService } from "@corelib";

@Component({
  selector: "app-subscription-plans",
  standalone: true,
  imports: [CommonModule, IconComponent, ButtonComponent, RouterLink],
  templateUrl: "./subscription-plans.component.html",
  styleUrl: "./subscription-plans.component.scss",
})
export class SubscriptionPlansComponent {
  router = inject(Router);
  subscriptionService = inject(SubscriptionPlansService);

  @Input() open = false;
  @Input({ required: true }) subscriptionPlans!: SubscriptionPlan[];

  @Output() openChange = new EventEmitter<boolean>();

  onBuyClick(planId: SubscriptionPlan["id"]) {
    this.subscriptionService.buySubscription(planId).subscribe(status => {
      location.href = status.confirmation.confirmationUrl;
    });
  }
}
