/** @format */

import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AvatarComponent } from "@uilib";
import { GeneralRating } from "../../../../models/rating.model";
import { PluralizePipe } from "@corelib";

@Component({
  selector: "app-basic-rating-card",
  standalone: true,
  imports: [CommonModule, AvatarComponent, PluralizePipe],
  templateUrl: "./basic-rating-card.component.html",
  styleUrl: "./basic-rating-card.component.scss",
})
export class BasicRatingCardComponent {
  @Input({ required: true }) rating!: GeneralRating;
}
