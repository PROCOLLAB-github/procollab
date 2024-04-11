/** @format */

import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PersonalRatingCardComponent } from "../shared/personal-rating-card/personal-rating-card.component";

@Component({
  selector: "app-skills-rating",
  standalone: true,
  imports: [CommonModule, PersonalRatingCardComponent],
  templateUrl: "./skills-rating.component.html",
  styleUrl: "./skills-rating.component.scss",
})
export class ProfileSkillsRatingComponent {
  protected readonly Array = Array;
}
