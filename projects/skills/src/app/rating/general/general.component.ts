/** @format */

import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TopRatingCardComponent } from "../shared/top-rating-card/top-rating-card.component";
import { BasicRatingCardComponent } from "../shared/basic-rating-card/basic-rating-card.component";

@Component({
  selector: "app-general",
  standalone: true,
  imports: [CommonModule, TopRatingCardComponent, BasicRatingCardComponent],
  templateUrl: "./general.component.html",
  styleUrl: "./general.component.scss",
})
export class RatingGeneralComponent {
  protected readonly Array = Array;
}
