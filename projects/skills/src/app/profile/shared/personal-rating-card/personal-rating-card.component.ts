/** @format */

import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CircleProgressBarComponent } from "../../../shared/circle-progress-bar/circle-progress-bar.component";
import { Skill } from "projects/skills/src/models/profile.model";
import { PluralizePipe } from "@corelib";

@Component({
  selector: "app-personal-rating-card",
  standalone: true,
  imports: [CommonModule, CircleProgressBarComponent, PluralizePipe],
  templateUrl: "./personal-rating-card.component.html",
  styleUrl: "./personal-rating-card.component.scss",
})
export class PersonalRatingCardComponent {
  @Input() personalRatingCardData!: Skill;
}
