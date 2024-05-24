/** @format */

import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { IconComponent } from "@uilib";
import { ButtonComponent } from "@ui/components";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { toSignal } from "@angular/core/rxjs-interop";
import { map } from "rxjs";

@Component({
  selector: "app-subscription-plans",
  standalone: true,
  imports: [CommonModule, IconComponent, ButtonComponent, RouterLink],
  templateUrl: "./subscription-plans.component.html",
  styleUrl: "./subscription-plans.component.scss",
})
export class SubscriptionPlansComponent {
  route = inject(ActivatedRoute)

  subscriptionPlans = toSignal(this.route.data.pipe(map(r => r['data'])));
}
