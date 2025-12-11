/** @format */

import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";

@Component({
  selector: "app-badge",
  templateUrl: "./badge.component.html",
  styleUrl: "./badge.component.scss",
  imports: [CommonModule],
  standalone: true,
})
export class BadgeComponent {
  @Input() color: "green" | "red" | "gold" = "red";
  @Input() type: "deadline" | "start" = "deadline";
}
