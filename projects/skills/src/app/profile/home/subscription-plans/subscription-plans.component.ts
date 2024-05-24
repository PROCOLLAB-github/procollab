/** @format */

import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { IconComponent } from "@uilib";
import { ButtonComponent } from "@ui/components";
import { RouterLink } from "@angular/router";
import { SubscriptionPlansService } from "../../services/subscription-plans.service";
import { SubscriptionPlan } from "projects/skills/src/models/subscription.model";

@Component({
  selector: "app-subscription-plans",
  standalone: true,
  imports: [CommonModule, IconComponent, ButtonComponent, RouterLink],
  templateUrl: "./subscription-plans.component.html",
  styleUrl: "./subscription-plans.component.scss",
})
export class SubscriptionPlansComponent implements OnInit {
  subscriptionService = inject(SubscriptionPlansService)
  protected subscriptionPlans = signal<SubscriptionPlan[]>([])

  ngOnInit(): void {
    this.subscriptionService.getSubscriptions().subscribe((plans) => this.subscriptionPlans.set(plans as SubscriptionPlan[]))
  }

}
