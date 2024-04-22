/** @format */

import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { IconComponent } from "@uilib";
import { ButtonComponent } from "@ui/components";

@Component({
  selector: "app-subscription-plans",
  standalone: true,
  imports: [CommonModule, IconComponent, ButtonComponent],
  templateUrl: "./subscription-plans.component.html",
  styleUrl: "./subscription-plans.component.scss",
})
export class SubscriptionPlansComponent {
  protected readonly Array = Array;
}
