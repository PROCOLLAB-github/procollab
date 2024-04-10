/** @format */

import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AvatarComponent } from "@uilib";

@Component({
  selector: "app-top-rating-card",
  standalone: true,
  imports: [CommonModule, AvatarComponent],
  templateUrl: "./top-rating-card.component.html",
  styleUrl: "./top-rating-card.component.scss",
})
export class TopRatingCardComponent {
  @Input() place = 3;
}
