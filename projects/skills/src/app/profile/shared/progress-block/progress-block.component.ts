/** @format */

import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CircleProgressBarComponent } from "../../../shared/circle-progress-bar/circle-progress-bar.component";

@Component({
  selector: "app-progress-block",
  standalone: true,
  imports: [CommonModule, CircleProgressBarComponent],
  templateUrl: "./progress-block.component.html",
  styleUrl: "./progress-block.component.scss",
})
export class ProgressBlockComponent {
  @Input() progress = 0;

  radius = 70;

  calculateStrokeDashOffset(): number {
    const circumference = 2 * Math.PI * this.radius; // 2 * π * radius
    return circumference - (this.progress / 100) * circumference;
  }

  calculateStrokeDashArray(): number {
    return 2 * Math.PI * this.radius; // 2 * π * radius
  }
  
  circles = Array(5);
  
  skillsList = Array;
}
