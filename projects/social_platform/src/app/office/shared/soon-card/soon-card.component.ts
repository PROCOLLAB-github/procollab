/** @format */

import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { ButtonComponent } from "@ui/components";
import { IconComponent } from "@uilib";

@Component({
  selector: "app-soon-card",
  templateUrl: "./soon-card.component.html",
  styleUrl: "./soon-card.component.scss",
  imports: [CommonModule, IconComponent, ButtonComponent],
  standalone: true,
})
export class SoonCardComponent {
  @Input() title!: string;

  @Input() description!: string;
}
