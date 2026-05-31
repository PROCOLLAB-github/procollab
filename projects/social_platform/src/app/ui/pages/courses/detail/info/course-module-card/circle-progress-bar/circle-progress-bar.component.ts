/** @format */

import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { IconComponent } from "@ui/primitives";

/** Круглый SVG-прогресс-бар. */
@Component({
    selector: "app-circle-progress-bar",
    imports: [CommonModule, IconComponent],
    templateUrl: "./circle-progress-bar.component.html",
    styleUrl: "./circle-progress-bar.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CircleProgressBarComponent {
  @Input() progress = 0;

  @Input() mode: "button" | "progress" = "progress";

  @Input() appereance?: "open" | "closed";

  @Input() haveDate?: boolean = false;

  radius = 70;

  calculateStrokeDashOffset(): number {
    const circumference = 2 * Math.PI * this.radius; // Длина окружности: 2 * π * радиус
    return circumference - (this.progress / 100) * circumference;
  }

  calculateStrokeDashArray(): number {
    return 2 * Math.PI * this.radius; // Полная длина окружности: 2 * π * радиус
  }
}
