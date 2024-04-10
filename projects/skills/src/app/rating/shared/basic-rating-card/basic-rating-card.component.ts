/** @format */

import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AvatarComponent } from "@uilib";

@Component({
  selector: "app-basic-rating-card",
  standalone: true,
  imports: [CommonModule, AvatarComponent],
  templateUrl: "./basic-rating-card.component.html",
  styleUrl: "./basic-rating-card.component.scss",
})
export class BasicRatingCardComponent {}
