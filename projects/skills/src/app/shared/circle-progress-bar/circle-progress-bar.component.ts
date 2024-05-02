/** @format */

import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-circle-progress-bar",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./circle-progress-bar.component.html",
  styleUrl: "./circle-progress-bar.component.scss",
})
export class CircleProgressBarComponent {
  @Input() progress = 0;
  radius = 70;

  calculateStrokeDashOffset(): number {
    const circumference = 2 * Math.PI * this.radius; // 2 * π * radius
    return circumference - (this.progress / 100) * circumference;
  }

  calculateStrokeDashArray(): number {
    return 2 * Math.PI * this.radius; // 2 * π * radius
  }
}
