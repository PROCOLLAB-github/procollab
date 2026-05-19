/** @format */

import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

/** Канбан (модуль отключён): бейдж задачи. */
@Component({
  selector: "app-badge",
  templateUrl: "./badge.component.html",
  styleUrl: "./badge.component.scss",
  imports: [CommonModule],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeComponent {
  @Input() color: "green" | "red" | "gold" = "red";
  @Input() type: "deadline" | "start" = "deadline";
}
