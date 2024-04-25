/** @format */

import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AvatarComponent } from "@uilib";
import { GeneralRating } from "../../../../models/rating.model";

@Component({
  selector: "app-top-rating-card",
  standalone: true,
  imports: [CommonModule, AvatarComponent],
  templateUrl: "./top-rating-card.component.html",
  styleUrl: "./top-rating-card.component.scss",
})
export class TopRatingCardComponent {
  @Input() place = 3;

  @Input({ required: true }) rating!: GeneralRating;
}
