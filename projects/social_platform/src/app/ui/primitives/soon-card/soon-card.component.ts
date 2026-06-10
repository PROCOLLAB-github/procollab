/** @format */

import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { ButtonComponent } from "../button/button.component";
import { IconComponent } from "../icon/icon.component";

/** Примитив: карточка-заглушка «скоро». */
@Component({
  selector: "app-soon-card",
  templateUrl: "./soon-card.component.html",
  styleUrl: "./soon-card.component.scss",
  imports: [CommonModule, IconComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SoonCardComponent {
  title = input.required<string>();
  description = input.required<string>();
}
