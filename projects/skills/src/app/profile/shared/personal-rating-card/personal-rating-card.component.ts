/** @format */

import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CircleProgressBarComponent } from "../../../shared/circle-progress-bar/circle-progress-bar.component";

@Component({
  selector: "app-personal-rating-card",
  standalone: true,
  imports: [CommonModule, CircleProgressBarComponent],
  templateUrl: "./personal-rating-card.component.html",
  styleUrl: "./personal-rating-card.component.scss",
})
export class PersonalRatingCardComponent {}
